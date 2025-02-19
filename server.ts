import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import next from "next";
import dotenv from "dotenv";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { FastifyRequest, FastifyInstance } from "fastify";
import twilio from "twilio";
import { LOG_EVENT_TYPES, SYSTEM_MESSAGE } from "@/app/lib/constants";

dotenv.config();

console.log("Starting server...");

const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Store UI WebSocket connections
const uiConnections = new Set<WebSocket>();

async function noOpParser(_req: FastifyRequest, payload: IncomingMessage) {
  return payload;
}

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  PHONE_NUMBER_FROM,
  DOMAIN: rawDomain,
  OPENAI_API_KEY,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !PHONE_NUMBER_FROM || !rawDomain || !OPENAI_API_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const DOMAIN = rawDomain.replace(/(^\w+:|^)\/\//, "").replace(/\/+$/, "");
const VOICE = "alloy";
const outboundTwiML = `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="wss://${DOMAIN}/media-stream" /></Connect></Response>`;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const server = fastify({ logger: true });

// Broadcast to all UI connections
function broadcastToUI(message: any) {
  uiConnections.forEach((conn) => {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(message));
    }
  });
}

async function startServer() {
  try {
    await app.prepare();

    server.addContentTypeParser("application/json", noOpParser);
    server.addContentTypeParser("text/plain", noOpParser);

    await server.register(fastifyFormBody);
    await server.register(fastifyWs);

    server.all("/api/*", async (req, res) => {
      await handle(req.raw, res.raw);
    });

    server.all("*", async (req, res) => {
      await handle(req.raw, res.raw);
    });

    server.register(async (fastify: FastifyInstance) => {
      // UI WebSocket endpoint
      fastify.get('/ui-updates', { websocket: true }, (connection) => {
        console.log('UI client connected');
        uiConnections.add(connection);

        connection.on('close', () => {
          console.log('UI client disconnected');
          uiConnections.delete(connection);
        });
      });

      // Media streaming WebSocket endpoint
      fastify.get('/media-stream', { websocket: true }, (connection, req) => {
        console.log('Media client connected');
        
        const openAiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1"
          }
        });

        let streamSid: string | null = null;
        let fullTranscript = '';

        const sendInitialSessionUpdate = () => {
          const sessionUpdate = {
            type: 'session.update',
            session: {
              turn_detection: { type: 'server_vad' },
              input_audio_format: 'g711_ulaw',
              output_audio_format: 'g711_ulaw',
              voice: VOICE,
              input_audio_transcription: { model: 'whisper-1' },
              instructions: SYSTEM_MESSAGE,
              modalities: ["text", "audio"],
              temperature: 0.8,
            }
          };

          openAiWs.send(JSON.stringify(sessionUpdate));

          const initialConversationItem = {
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: 'Greet the restaurant with "Hello there! I\'m hoping to book a reservation at this restaurant!"'
                }
              ]
            }
          };

          openAiWs.send(JSON.stringify(initialConversationItem));
          openAiWs.send(JSON.stringify({ type: 'response.create' }));
        };

        openAiWs.on('open', () => {
          console.log('Connected to the OpenAI Realtime API');
          setTimeout(sendInitialSessionUpdate, 100);
        });

        openAiWs.on('message', (data) => {
          try {
            let messageString: string;

            if (typeof data === 'string') {
              messageString = data;
            } else if (data instanceof Buffer) {
              messageString = data.toString('utf8');
            } else {
              console.error('Unknown data type received:', typeof data);
              return;
            }

            const response = JSON.parse(messageString);

            if (LOG_EVENT_TYPES.includes(response.type)) {
              console.log(`Received event: ${response.type}`, response);
            }

            if (response.type === 'response.audio.delta' && response.delta) {
              const audioDelta = {
                event: 'media',
                streamSid: streamSid,
                media: { payload: Buffer.from(response.delta, 'base64').toString('base64') }
              };
              connection.send(JSON.stringify(audioDelta));
            }

            if (response.type === 'response.audio_transcript.delta' && response.delta) {
              fullTranscript += response.delta;
              broadcastToUI({
                event: "transcript.ai",
                transcript: response.delta
              });
            }

            if (response.type === 'conversation.item.input_audio_transcription.completed') {
              broadcastToUI({
                event: 'transcript.user',
                transcript: response.transcript
              });
            }
          } catch (error) {
            console.error('Error processing OpenAI message:', error, 'Raw message:', data);
          }
        });

        connection.on('message', (message) => {
          try {
            let messageString: string;

            if (typeof message === 'string') {
              messageString = message;
            } else if (message instanceof Buffer) {
              messageString = message.toString('utf8');
            } else {
              console.error("unknown type");
              return;
            }
            const data = JSON.parse(messageString);

            switch (data.event) {
              case 'media':
                if (openAiWs.readyState === WebSocket.OPEN) {
                  const audioAppend = {
                    type: 'input_audio_buffer.append',
                    audio: data.media.payload
                  };
                  openAiWs.send(JSON.stringify(audioAppend));
                }
                break;
              case 'start':
                streamSid = data.start.streamSid;
                console.log('Incoming stream has started', streamSid);
                break;
              default:
                console.log('Received non-media event:', data.event);
                break;
            }
          } catch (error) {
            console.error('Error parsing message:', error, 'Message:', message);
          }
        });

        connection.on('close', () => {
          if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
          console.log('Media client disconnected');
        });

        openAiWs.on('close', () => {
          console.log('Disconnected from the OpenAI Realtime API');
        });

        openAiWs.on('error', (error) => {
          console.error('Error in the OpenAI WebSocket:', error);
        });
      });
    });

    server.listen({ port: PORT }, (err, address) => {
      if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
      }
      console.log(`Server running at ${address}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

async function isNumberAllowed(to: string) {
  try {
    const incomingNumbers = await client.incomingPhoneNumbers.list({ phoneNumber: to });
    if (incomingNumbers.length > 0) return true;

    const outgoingCallerIds = await client.outgoingCallerIds.list({ phoneNumber: to });
    if (outgoingCallerIds.length > 0) return true;

    return false;
  } catch (error) {
    console.error("Error checking phone number:", error);
    return false;
  }
}

startServer();
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
import { LOG_EVENT_TYPES } from "@/app/lib/constants";

dotenv.config();

console.log("Starting server...");

const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// No-Op Parser (Prevents Fastify from interfering with Next.js)
async function noOpParser(_req: FastifyRequest, payload: IncomingMessage) {
  return payload;
}

// Twilio & OpenAI Setup
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
const SYSTEM_MESSAGE = "You are an AI making restaurant reservations.";
const VOICE = "alloy";
const outboundTwiML = `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="wss://${DOMAIN}/media-stream" /></Connect></Response>`;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Initialize Fastify
const server = fastify({ logger: true });

async function startServer() {
  try {
    await app.prepare();

    // Register No-Op Body Parser
    server.addContentTypeParser("application/json", noOpParser);
    server.addContentTypeParser("text/plain", noOpParser);

    // Register CORS
    // await server.register(fastifyCors, {
    //   origin: "*",
    //   methods: ["GET", "POST", "PUT", "DELETE"],
    // });

    // Register WebSocket & FormBody for Twilio
    await server.register(fastifyFormBody);
    await server.register(fastifyWs);

    // Handle Next.js API routes
    server.all("/api/*", async (req, res) => {
      console.log(`Handling API request: ${req.url}`);
      await handle(req.raw, res.raw);
    });

    // Handle Next.js page requests
    server.all("*", async (req, res) => {
      console.log(`Handling page request: ${req.url}`);
      await handle(req.raw, res.raw);
    });

    server.register(async (fastify :FastifyInstance) => {
        // Setup WebSocket server for handling media streams
        fastify.get('/media-stream', { websocket: true }, (connection, req) => {
            console.log('Client connected');
            const openAiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
                headers : {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "OpenAI-Beta": "realtime=v1"
                }
            });
    
            let streamSid: string | null = null;
    
            const sendInitialSessionUpdate = () => {
                const sessionUpdate = {
                    type: 'session.update',
                    session: {
                        turn_detection: { type: 'server_vad' },
                        input_audio_format: 'g711_ulaw',
                        output_audio_format: 'g711_ulaw',
                        voice: VOICE,
                        input_audio_transcription: { model : 'whisper-1'},
                        instructions: SYSTEM_MESSAGE,
                        modalities: ["text", "audio"],
                        temperature: 0.8,
                    }
                };
    
                console.log('Sending session update:', JSON.stringify(sessionUpdate));
                openAiWs.send(JSON.stringify(sessionUpdate));
    
                const initialConversationItem = {
                    type: 'conversation.item.create',
                    item: {
                        type: 'message',
                        role: 'user',
                        content: [
                            {
                                type: 'input_text',
                                text: 'Greet the user with "Hello there! I\'m an AI voice assistant from Twilio and the OpenAI Realtime API. How can I help?"'
                            }
                        ]
                    }
                };
    
                openAiWs.send(JSON.stringify(initialConversationItem));
                openAiWs.send(JSON.stringify({ type: 'response.create' }));
            };
    
            // Open event for OpenAI WebSocket
            openAiWs.on('open', () => {
                console.log('Connected to the OpenAI Realtime API');
                setTimeout(sendInitialSessionUpdate, 100); // Ensure connection stability, send after .1 second
            });
    
            // Listen for messages from the OpenAI WebSocket (and send to Twilio if necessary)
            let fullTranscript = '';

            openAiWs.on('message', (data) => {
                try {
    
                    let messageString: string;
    
                    if(typeof data === 'string') {
                        messageString = data;
                    }
                    else if( data instanceof Buffer) {
                        messageString = data.toString('utf8');
                    }
                    else {
                        console.error('Unknown data type received:', typeof data); // Handle unexpected types
                        return;
                    }
    
                    const response = JSON.parse(messageString);
    
                    if (LOG_EVENT_TYPES.includes(response.type)) {
                        console.log(`Received event: ${response.type}`, response);
                    }
    
                    if (response.type === 'session.updated') {
                        console.log('Session updated successfully:', response);
                    }
    
                    if (response.type === 'response.audio.delta' && response.delta) {
                        const audioDelta = {
                            event: 'media',
                            streamSid: streamSid,
                            media: { payload: Buffer.from(response.delta, 'base64').toString('base64') }
                        };
                        connection.send(JSON.stringify(audioDelta));
                    }


                    if (response.type === 'response.audio_transcript.delta') {
                        
                        // If the transcript is directly in `response.delta` (no nested field)
                        if (response.delta) {
                            console.log('Partial Transcript delta:', response.delta);
                            fullTranscript += response.delta;

                            connection.send(JSON.stringify({
                                event: 'transcript.ai',
                                transcript: fullTranscript
                            }));
                        }
                    }

                    if (response.type === 'conversation.item.input_audio_transcription.completed') {
                        console.log("response type was conversation item input");
                        console.log(response.transcript);
                        connection.send(JSON.stringify({
                            event: 'transcript.user',
                            transcript: response.trascript
                        }));
                    }
                    
                } catch (error) {
                    console.error('Error processing OpenAI message:', error, 'Raw message:', data);
                }
            });

            if(fullTranscript.trim() !== '') {
                console.log("full transcript", fullTranscript);
            }
    
            // Handle incoming messages from Twilio
            connection.on('message', (message) => {
                try {
    
                    let messageString: string;
    
                    if(typeof message === 'string') {
                        messageString = message;
                    }
                    else if(message instanceof Buffer) {
                        messageString = message.toString('utf8');
                    }
                    else {
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
    
            // Handle connection close
            connection.on('close', () => {
                if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
                console.log('Client disconnected.');
            });
    
            // Handle WebSocket close and errors
            openAiWs.on('close', () => {
                console.log('Disconnected from the OpenAI Realtime API');
            });
    
            openAiWs.on('error', (error) => {
                console.error('Error in the OpenAI WebSocket:', error);
            });
        });
    });
    


    // Handle Twilio Call Request
    // server.post("/call", async (request, reply) => {
    //   const { to } = request.body as { to: string };
    //   console.log("request body is: ", request.body);
    //   if (!to) {
    //     return reply.status(400).send({ error: "Missing 'to' phone number" });
    //   }

    //   const isAllowed = await isNumberAllowed(to);
    //   if (!isAllowed) {
    //     return reply.status(403).send({ error: `Number ${to} is not allowed.` });
    //   }

    //   try {
    //     const call = await client.calls.create({
    //       from: PHONE_NUMBER_FROM!,
    //       to,
    //       twiml: outboundTwiML,
    //     });
    //     console.log(`Call started with SID: ${call.sid}`);
    //     return reply.send({ success: true, sid: call.sid });
    //   } catch (error) {
    //     console.error("Error making call:", error);
    //     return reply.status(500).send({ error: "Failed to initiate call" });
    //   }
    // });



    // Start Fastify Server
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

// Helper Function to Check Allowed Numbers
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

// Start Server
startServer();

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
import { raw } from "express";

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

    // Handle Twilio WebSocket Route
    server.register(async (fastify: FastifyInstance) => {
      fastify.get("/media-stream", { websocket: true }, (connection, req) => {
        console.log("Client connected to WebSocket");

        const openAiWs = new WebSocket(
          "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "OpenAI-Beta": "realtime=v1",
            },
          }
        );

        let streamSid: string | null = null;

        openAiWs.on("open", () => {
          console.log("Connected to OpenAI Realtime API");

          const sessionUpdate = {
            type: "session.update",
            session: {
              turn_detection: { type: "server_vad" },
              input_audio_format: "g711_ulaw",
              output_audio_format: "g711_ulaw",
              voice: VOICE,
              instructions: SYSTEM_MESSAGE,
              modalities: ["text", "audio"],
              temperature: 0.8,
            },
          };

          console.log("Sending session update:", sessionUpdate);
          openAiWs.send(JSON.stringify(sessionUpdate));
        });

        openAiWs.on("message", (data) => {
          const response = JSON.parse(data.toString());
          if (response.type === "response.audio.delta" && response.delta) {
            const audioDelta = {
              event: "media",
              streamSid: streamSid,
              media: { payload: Buffer.from(response.delta, "base64").toString("base64") },
            };
            connection.send(JSON.stringify(audioDelta));
          }
        });

        connection.on("message", (message) => {
          const data = JSON.parse(message.toString());
          if (data.event === "media" && openAiWs.readyState === WebSocket.OPEN) {
            openAiWs.send(JSON.stringify({ type: "input_audio_buffer.append", audio: data.media.payload }));
          }
        });

        connection.on("close", () => {
          openAiWs.close();
          console.log("Client disconnected.");
        });

        openAiWs.on("close", () => console.log("Disconnected from OpenAI Realtime API"));
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

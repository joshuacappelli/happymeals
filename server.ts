import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import next from "next";
import dotenv from "dotenv";
import { IncomingMessage } from "http"; // Required for No-Op parser
import { FastifyRequest } from "fastify"; // Required for No-Op parser

dotenv.config();

console.log("starting server process");

const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

// Initialize Fastify and Next.js
const server = fastify({ logger: true });
const app = next({ dev });
const handle = app.getRequestHandler();

// No-Op Parser (Prevents Next.js and Fastify from conflicting)
async function noOpParser(_req: FastifyRequest, payload: IncomingMessage) {
  return payload; // Fastify will NOT parse the body
}

async function startServer() {
  try {
    // Prepare Next.js
    await app.prepare();

    // Register No-Op Body Parser
    server.addContentTypeParser("application/json", noOpParser);
    server.addContentTypeParser("text/plain", noOpParser);

    // Register CORS if needed
    // await server.register(fastifyCors, {
    //   origin: "*",
    //   methods: ["GET", "POST", "PUT", "DELETE"],
    // });

    // Handle all requests using Next.js
    server.all("*", async (req, res) => {
      console.log(`Handling request for: ${req.url}`);
      console.log("Before handling Next.js request...");

      await handle(req.raw, res.raw);

      console.log("After handling Next.js request...");
    });

    // Start Fastify server
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

startServer();

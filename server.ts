import fastify from "fastify";
import fastifyExpress from "@fastify/express";
import fastifyCors from "@fastify/cors";
import next from "next";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

// Initialize Fastify and Next.js
const server = fastify({ logger: true });
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    // Prepare Next.js
    await app.prepare();

    // Register Fastify plugins
    await server.register(fastifyExpress);
    await server.register(fastifyCors, {
      origin: "*", // Allow all origins (you can restrict this for production)
      methods: ["GET", "POST", "PUT", "DELETE"],
    });

    // Handle all requests with Next.js
    server.all("/*", (req, res) => {
      return handle(req.raw, res.raw).then(() => {
        res.sent = true;
      });
    });

    // Start the server
    server.listen({ port: PORT }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`> Server is running at ${address}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

startServer();

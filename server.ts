import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import next from "next";
import dotenv from "dotenv";

dotenv.config();

console.log("starting server process");

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

    //  Register CORS **BEFORE** all routes to prevent conflicts
    // await server.register(fastifyCors, {
    //   origin: "*",
    //   methods: ["GET", "POST", "PUT", "DELETE"], // OPTIONS is implicitly added
    // });

    //  Use "*" instead of "/*" to prevent Fastify from overriding OPTIONS
    server.all("*", async (req, res) => {
        console.log(`Handling request for: ${req.url}`);
        console.log("Before handling Next.js request...");
      
        // ✅ Do NOT modify the response manually after `handle()`
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


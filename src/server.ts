import * as dotenv from "dotenv";
import { buildApp } from "./app.js";
import { pool } from "./db/client.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const app = buildApp({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Student Enrollment API running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown handling
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    await app.close();
    await pool.end();
    process.exit(0);
  });
}

start();

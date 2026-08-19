import app from "./app.js";
import prisma from "./config/prisma.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`NexGen Warehouse API listening on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

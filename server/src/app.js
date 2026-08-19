import express from "express";
import cors from "cors";
import path from "path";
import prisma from "./config/prisma.js";
import { env } from "./config/env.js";

import routes from "./routes/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), { maxAge: "1d" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to NexGen Warehouse API",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "nexgen-warehouse-api",
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Readiness check failed:", error);
    return res.status(503).json({
      success: false,
      status: "not_ready",
      database: "unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;

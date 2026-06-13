import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { config } from "./config";
import { getDb } from "./db/schema";
import chatRouter from "./routes/chat";
import { errorHandler } from "./middleware/errorHandler";



const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "*"
    : "*", // allow all in dev
  methods: ["GET", "POST"],
}));

app.use(express.json({ limit: "10kb" })); // prevent huge payload attacks
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────
// Deployment platforms ping this to know your app is alive
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────
app.use("/chat", chatRouter);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found.",
  });
});

// ─── Error Handler ────────────────────────────────────────────
// Must be registered LAST
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
function startServer() {
  try {
    // Initialize DB on startup — creates tables if they don't exist
    getDb();
    console.log("✅ Database initialized");

    app.listen(config.port, () => {
      console.log(`✅ Server running on http://localhost:${config.port}`);
      console.log(`✅ Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // crash loudly — don't run a broken server
  }
}

startServer();
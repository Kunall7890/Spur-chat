import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  groqApiKey: requireEnv("GROQ_API_KEY"),
  nodeEnv: process.env.NODE_ENV || "development",
};
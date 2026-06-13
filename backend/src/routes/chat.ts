import { Router, Request, Response } from "express";
import {
  createConversation,
  conversationExists,
  saveMessage,
  getMessagesByConversation,
} from "../db/queries";
import { generateReply } from "../services/llmService";

const router = Router();

// ─── Constants ───────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 1000;

// ─── POST /chat/message ──────────────────────────────────────
// Main endpoint — accepts a message, returns AI reply
router.post("/message", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.body;

    // ── Input Validation ──
    if (!message || typeof message !== "string") {
      res.status(400).json({
        success: false,
        error: "Message is required and must be a string.",
      });
      return;
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage === "") {
      res.status(400).json({
        success: false,
        error: "Message cannot be empty.",
      });
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({
        success: false,
        error: `Message too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
      });
      return;
    }

    // ── Session Handling ──
    // If sessionId provided and valid → reuse it
    // Otherwise → create a fresh conversation
    let conversationId: string;

    if (sessionId && typeof sessionId === "string" && conversationExists(sessionId)) {
      conversationId = sessionId;
    } else {
      const conversation = createConversation();
      conversationId = conversation.id;
    }

    // ── Fetch History & Generate Reply ──
    const history = getMessagesByConversation(conversationId);

    // Save user message first
    saveMessage(conversationId, "user", trimmedMessage);

    // Generate AI reply with full history for context
    const aiReply = await generateReply(history, trimmedMessage);

    // Save AI reply
    saveMessage(conversationId, "ai", aiReply);

    res.status(200).json({
      success: true,
      reply: aiReply,
      sessionId: conversationId,
    });

  } catch (error) {
    console.error("[POST /chat/message]", error);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred. Please try again.",
    });
  }
});

// ─── GET /chat/history/:sessionId ────────────────────────────
router.get("/history/:sessionId", (req: Request, res: Response): void => {
  try {
    const sessionId = req.params.sessionId as string;

    if (!sessionId || !conversationExists(sessionId)) {
      res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
      return;
    }

    const messages = getMessagesByConversation(sessionId);

    res.status(200).json({
      success: true,
      sessionId,
      messages,
    });

  } catch (error) {
    console.error("[GET /chat/history]", error);
    res.status(500).json({
      success: false,
      error: "Could not fetch conversation history.",
    });
  }
});

export default router;
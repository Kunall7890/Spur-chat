import { getDb } from "./schema";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  conversation_id: string;
  sender: "user" | "ai";
  text: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
}

// ─── Conversations ───────────────────────────────────────────

export function createConversation(): Conversation {
  const db = getDb();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO conversations (id) VALUES (?)
  `).run(id);

  return { id, created_at: new Date().toISOString() };
}

export function conversationExists(id: string): boolean {
  const db = getDb();
  const row = db.prepare(`
    SELECT id FROM conversations WHERE id = ?
  `).get(id);
  return !!row;
}

// ─── Messages ────────────────────────────────────────────────

export function saveMessage(
  conversationId: string,
  sender: "user" | "ai",
  text: string
): Message {
  const db = getDb();
  const id = uuidv4();
  const created_at = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender, text, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, conversationId, sender, text, created_at);

  return { id, conversation_id: conversationId, sender, text, created_at };
}

export function getMessagesByConversation(conversationId: string): Message[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).all(conversationId) as Message[];
}
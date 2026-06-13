import Groq from "groq-sdk";
import { config } from "../config";
import { Message } from "../db/queries";

const groq = new Groq({ apiKey: config.groqApiKey });

// ─── Fictional Store FAQ Knowledge ───────────────────────────
const STORE_KNOWLEDGE = `You are a helpful customer support agent for "ShopEase" — a fictional e-commerce store.

STORE INFORMATION:
- Store Name: ShopEase
- Website: www.shopease.com
- Support Hours: Monday to Saturday, 9 AM – 6 PM IST

SHIPPING POLICY:
- Standard delivery: 5–7 business days (Free on orders above ₹499)
- Express delivery: 2–3 business days (₹99 flat fee)
- We ship across India. International shipping is not available yet.
- Orders are processed within 24 hours of placement.
- You will receive a tracking link via email once your order ships.

RETURN & REFUND POLICY:
- Returns accepted within 7 days of delivery.
- Item must be unused, unwashed, and in original packaging.
- To initiate a return, email support@shopease.com with your order ID.
- Refunds are processed within 5–7 business days to the original payment method.
- Sale/discounted items are not eligible for returns.

PAYMENT METHODS:
- UPI, Credit/Debit Cards, Net Banking, EMI, Cash on Delivery (COD)
- COD available on orders below ₹5000.

CANCELLATION POLICY:
- Orders can be cancelled within 2 hours of placement.
- Once shipped, orders cannot be cancelled — initiate a return instead.

CONTACT:
- Email: support@shopease.com
- Phone: 1800-XXX-XXXX (toll-free, Mon–Sat, 9 AM – 6 PM IST)

BEHAVIOR GUIDELINES:
- Be friendly, concise, and professional.
- If you don't know something, say so honestly and direct the customer to support@shopease.com.
- Never make up information not listed above.
- Always address the customer's concern directly.
- Keep responses under 100 words unless the question genuinely needs more detail.`;

// ─── Main Function ───────────────────────────────────────────
export async function generateReply(
  history: Message[],
  userMessage: string
): Promise<string> {
  try {
    // Convert DB messages to Groq format
    const chatHistory = history
      .slice(-10)
      .map((msg) => ({
        role: msg.sender === "user" ? "user" as const : "assistant" as const,
        content: msg.text,
      }));

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: STORE_KNOWLEDGE,
        },
        ...chatHistory,
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content;

    if (!text || text.trim() === "") {
      return "I'm sorry, I couldn't generate a response. Please try again.";
    }

    console.log("[LLM] Success with Groq llama-3.3-70b");
    return text.trim();

  } catch (error: unknown) {
    console.error("[LLM Error]", error);
    return handleLLMError(error);
  }
}

// ─── Error Handler ────────────────────────────────────────────
function handleLLMError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("api key") || msg.includes("unauthorized") || msg.includes("401")) {
      return "I'm having trouble connecting right now. Please contact support@shopease.com.";
    }
    if (msg.includes("quota") || msg.includes("rate limit") || msg.includes("429")) {
      return "I'm receiving a lot of messages right now. Please try again in a moment.";
    }
    if (msg.includes("timeout") || msg.includes("network")) {
      return "I'm experiencing connectivity issues. Please try again or reach us at support@shopease.com.";
    }
  }

  return "Something went wrong on my end. Please try again or contact support@shopease.com.";
}
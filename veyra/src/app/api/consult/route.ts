import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import type { Msg } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.OPENAI_MODEL || "llama-3.3-70b-versatile";

// Best-effort in-memory rate limit (per warm serverless instance). For
// production-grade limiting across instances, back this with Upstash/Redis.
const hits = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const WINDOW = 60_000;
  const MAX = 20;
  const e = hits.get(ip);
  if (!e || now - e.t > WINDOW) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  e.n += 1;
  return e.n > MAX;
}

function sanitize(messages: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is Msg =>
        !!m &&
        typeof (m as Msg).content === "string" &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant")
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "VEYRA is not configured yet — add OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "You're moving fast — give VEYRA a moment and try again." },
      { status: 429 }
    );
  }

  let payload: { messages?: unknown };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const messages = sanitize(payload.messages);
  if (!messages.length) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  try {
    const stream = await openai.chat.completions.create({
      model: MODEL,
      stream: true,
      temperature: 0.6,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch {
          controller.enqueue(
            encoder.encode("\n\n[VEYRA lost the thread for a second — please resend.]")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return Response.json(
      { error: "VEYRA couldn't reach its reasoning engine. Please try again." },
      { status: 502 }
    );
  }
}

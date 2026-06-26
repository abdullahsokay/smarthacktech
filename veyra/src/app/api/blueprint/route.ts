import OpenAI from "openai";
import { BLUEPRINT_PROMPT } from "@/lib/prompt";
import type { Msg } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.OPENAI_MODEL || "llama-3.3-70b-versatile";

function sanitize(messages: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is Msg =>
        !!m &&
        typeof (m as Msg).content === "string" &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant")
    )
    .slice(-24)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Not configured" }, { status: 503 });
  }

  let payload: { messages?: unknown };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const messages = sanitize(payload.messages);
  if (!messages.length) {
    return Response.json(
      { error: "Tell VEYRA a little about your project first." },
      { status: 400 }
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: BLUEPRINT_PROMPT },
        ...messages,
        {
          role: "user",
          content:
            "Generate the final project blueprint JSON now, based on everything discussed above.",
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "VEYRA's blueprint came back malformed — please try again." },
        { status: 502 }
      );
    }
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "VEYRA couldn't compile the blueprint right now. Please retry." },
      { status: 502 }
    );
  }
}

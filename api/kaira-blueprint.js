/* ============================================================
   KAIRA — Blueprint engine (HackTech)
   Turns the conversation into a structured project blueprint:
   architecture, stack, security, scalability, estimation, proposal.
   Returns strict JSON (rendered by the widget into a live panel).
   ============================================================ */

const BLUEPRINT_PROMPT = `You are KAIRA, HackTech's senior AI Solutions Architect. Based on the conversation so far, produce a complete, realistic project blueprint as a SINGLE JSON object — no prose, no markdown, JSON only.

Use this exact shape:
{
  "projectName": string,
  "summary": string,
  "architecture": [ { "layer": string, "tech": string, "note": string } ],   // 4–7 layers, top-to-bottom flow order
  "stack": { "frontend": string, "backend": string, "database": string, "ai": string, "infrastructure": string },
  "security": [string],            // 3–5 concrete recommendations
  "scalability": [string],         // 3–5 concrete considerations
  "estimation": {
    "complexityScore": number,     // integer 1–10
    "complexityLabel": string,     // "Low" | "Moderate" | "High" | "Very High"
    "timeline": string,            // e.g. "8–12 weeks"
    "teamSize": string,            // e.g. "3–4 specialists"
    "budgetRange": string,         // a RANGE, never an exact figure
    "phases": [ { "name": string, "weeks": string, "focus": string } ],  // 3–5
    "risks": [string]              // 2–4
  },
  "proposal": {
    "overview": string,
    "scope": [string],             // 4–7
    "deliverables": [string],      // 4–7
    "nextSteps": [string]          // 3
  }
}

Rules: make senior-level, realistic assumptions where the user was vague. Recommend a modern, pragmatic stack suited to the project. budgetRange must be a range and reflect the complexity (never a single exact number). Tie it to what HackTech (Pakistan) can build. Output ONLY the JSON object.`;

const sb = require("./_supabase");
const rl = require("./_ratelimit");

function sanitize(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .slice(-24)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (rl.limited("blueprint", req, 8, 60000)) {
    return res.status(429).json({ error: "Too many requests — please slow down." });
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "KAIRA isn't configured yet." });

  let data = req.body;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = {}; } }
  data = data || {};

  const messages = sanitize(data.messages);
  if (!messages.length) {
    return res.status(400).json({ error: "Tell KAIRA a little about your project first." });
  }

  sb.insert("events", { type: "blueprint" });

  const base = (process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "llama-3.3-70b-versatile";

  try {
    const r = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: BLUEPRINT_PROMPT },
          ...messages,
          { role: "user", content: "Generate the final project blueprint JSON now, based on everything above." },
        ],
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "KAIRA couldn't compile the blueprint. Please retry." });
    const j = await r.json();
    const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "{}";
    let bp;
    try { bp = JSON.parse(text); } catch { return res.status(502).json({ error: "Blueprint came back malformed — please retry." }); }
    return res.status(200).json(bp);
  } catch {
    return res.status(502).json({ error: "KAIRA couldn't reach its reasoning engine." });
  }
};

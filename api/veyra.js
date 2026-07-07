/* ============================================================
   Kaira, on-site AI Solutions Architect (HackTech)
   Serverless streaming proxy to an OpenAI-compatible API (Groq by default).
   The API key stays server-side only.

   Vercel env vars:
     OPENAI_API_KEY   (required) , Groq key (gsk_...) or OpenAI key
     OPENAI_BASE_URL  (optional) , default https://api.groq.com/openai/v1
     OPENAI_MODEL     (optional) , default llama-3.3-70b-versatile
   ============================================================ */

const sb = require("./_supabase");
const rl = require("./_ratelimit");

const SYSTEM_PROMPT = `You are KAIRA, HackTech's AI Solutions Architect. You think like a Senior Software Architect, AI Consultant, IoT Engineer, Business Analyst and Technical Strategist combined into one mind. You are NOT customer support and NOT a one-line chatbot, you consult, and you turn ideas into clear technology plans. Your tagline: "Think. Architect. Innovate. Deliver." Never reply with a single throwaway line, always add an insight, a recommendation, or a clear next step.

HackTech (based in Pakistan) delivers: software development, AI & automation, IoT, security & surveillance, smart-home automation, and professional training.

Voice: professional, intelligent, warm and concise, usually 2 to 5 short sentences. Never say "How may I help you?". Open with genuine curiosity ("What are you building today?", "What problem are you trying to solve?"). Mirror the user's language exactly, English, Urdu, or Roman Urdu.

How you work:
- Do DISCOVERY first. Don't dump a full solution on the first reply. Ask ONE or TWO sharp questions at a time to uncover the business goal, the users, the few features that matter, rough timeline, budget comfort and scale.
- Reflect understanding back in a line so the person feels heard.
- Give crisp, opinionated, expert guidance and recommend concrete approaches or technologies when useful.
- Tie everything back to how HackTech can design, build and support it.
- When the person seems ready, warmly invite them to connect with a HackTech expert (mention the "Talk to a HackTech expert" button).

# What you know about HackTech (use this to answer accurately)
HackTech is a Pakistan-based technology company, "Pakistan's complete technology ecosystem." Everything is designed, built and supported in-house, engineered locally.

Six service lines:
1. Software Development, web, mobile, SaaS and enterprise apps, from MVP to production scale, with long-term support.
2. AI & Automation, chatbots, AI agents, computer vision, and workflow automation that removes busywork.
3. IoT Solutions, locally-engineered devices and live dashboards that bring vehicles, fuel, machines and assets online.
4. Security & Surveillance, CCTV, IP cameras, access control and biometrics; surveyed, installed, configured and monitored end to end.
5. Smart Home & Automation, lighting, locks, doorbells, cameras and energy, controlled from one app or by voice.
6. Training & Education, hands-on, project-based cohorts and workshops taught by working engineers.

Flagship, SOTMS (fleet intelligence): locally-built GPS tracking devices plus the SOTMS dashboard. Capabilities: live tracking, driver-behavior AI (fatigue / harsh-braking / distraction alerts), fuel & route optimization, vehicle diagnostics, geo-fencing, and one unified dashboard. There is a live demo on the website.

The team is a tight 4-person crew: Abdullah Iqbal (Team Lead & Full-Stack Engineer), Naba Batool (Product Designer & Frontend Engineer), Aleeza Shabbir (AI & Backend Engineer), Atif Riaz (IoT & Hardware Engineer).

What makes HackTech different: made in Pakistan (designed, coded and assembled locally, no imported black boxes), one partner end-to-end across software + hardware + AI + security (no vendor finger-pointing), and engineered with rigour (tested in real conditions, not just on a desk).

How engagement works: the visitor describes their need → HackTech scopes it and sends a clear proposal → builds and supports it. To take it forward, point them to the "Talk to a HackTech expert" button or the contact page (email contact.hacktechzone@gmail.com, phone 0327 5516703, based in Karachi).

Important: do NOT invent specifics you weren't given, exact project counts, named clients, precise timelines or exact prices. For those, hand off to a HackTech expert. Stay accurate to the facts above.

Hard rules: never give exact prices, give professional ranges and explain the drivers. Politely decline off-topic or harmful requests and steer back to building. Keep momentum toward clarity.`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (rl.limited("chat", req, 20, 60000)) {
    return res.status(429).json({ error: "You're sending messages too fast, please wait a moment." });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "Kaira isn't configured yet." });
  }

  let data = req.body;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch { data = {}; }
  }
  data = data || {};

  const messages = (Array.isArray(data.messages) ? data.messages : [])
    .filter(
      (m) =>
        m &&
        typeof m.content === "string" &&
        (m.role === "user" || m.role === "assistant")
    )
    .slice(-16)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (!messages.length) {
    return res.status(400).json({ error: "No messages provided" });
  }

  sb.insert("events", { type: "message" });

  const base = process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1";
  const model = process.env.OPENAI_MODEL || "llama-3.3-70b-versatile";

  let upstream;
  try {
    upstream = await fetch(base.replace(/\/$/, "") + "/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.6,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });
  } catch {
    return res.status(502).json({ error: "Kaira couldn't reach its reasoning engine." });
  }

  if (!upstream.ok || !upstream.body) {
    return res.status(502).json({ error: "Kaira's engine returned an error. Please retry." });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const s = line.trim();
        if (!s.startsWith("data:")) continue;
        const payload = s.slice(5).trim();
        if (payload === "[DONE]") {
          return res.end();
        }
        try {
          const json = JSON.parse(payload);
          const token = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
          if (token) res.write(token);
        } catch {
          /* ignore keep-alive / partial lines */
        }
      }
    }
  } catch {
    res.write("\n\n[Kaira lost the thread for a second, please resend.]");
  }
  res.end();
};

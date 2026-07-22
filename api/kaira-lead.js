/* ============================================================
   KAIRA — Lead capture + qualification (HackTech)
   Validates, classifies Hot / Warm / Cold, and (if RESEND_API_KEY
   is set) emails the lead to HackTech. Returns { ok, tier }.
   ============================================================ */

const sb = require("./_supabase");
const rl = require("./_ratelimit");

function classify(b) {
  let score = 0;
  const budget = (b.budget || "").toLowerCase();
  const timeline = (b.timeline || "").toLowerCase();

  if (/(2m|2 m|enterprise|8k|million|crore)/.test(budget)) score += 2;
  else if (/(500k|2k|8k|lakh)/.test(budget)) score += 1.5;
  else if (/(100k|500)/.test(budget)) score += 1;

  if (/(asap|this month|urgent|immediately|now)/.test(timeline)) score += 2;
  else if (/(1.?3|1-3|month)/.test(timeline)) score += 1;
  else if (/(3.?6|3-6|quarter)/.test(timeline)) score += 0.5;

  if (b.company && b.company.trim().length > 1) score += 1;
  if (b.industry && b.industry.trim().length > 1) score += 0.5;

  if (score >= 4) return "Hot";
  if (score >= 2) return "Warm";
  return "Cold";
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (rl.limited("lead", req, 5, 60000)) {
    return res.status(429).json({ error: "Too many requests — please slow down." });
  }

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  // honeypot — bots fill hidden fields; real users never see it
  if (b._hp) return res.status(200).json({ ok: true, tier: "Cold" });

  const name = (b.name || "").trim();
  const email = (b.email || "").trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Please share your name and a valid email." });
  }

  const tier = classify(b);

  let emailOk = false;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const to = process.env.CONTACT_TO || "contact.hacktechzone@gmail.com";
    const from = process.env.CONTACT_FROM || "KAIRA <onboarding@resend.dev>";
    const html =
      `<h2>New KAIRA lead — <b>${esc(tier)}</b></h2>` +
      `<p><b>Name:</b> ${esc(name)}</p>` +
      `<p><b>Email:</b> ${esc(email)}</p>` +
      (b.company ? `<p><b>Company:</b> ${esc(b.company)}</p>` : "") +
      (b.industry ? `<p><b>Industry:</b> ${esc(b.industry)}</p>` : "") +
      (b.budget ? `<p><b>Budget:</b> ${esc(b.budget)}</p>` : "") +
      (b.timeline ? `<p><b>Timeline:</b> ${esc(b.timeline)}</p>` : "") +
      (b.context ? `<p><b>Conversation context:</b><br>${esc(b.context).slice(0, 1500).replace(/\n/g, "<br>")}</p>` : "") +
      `<hr><p style="color:#888;font-size:12px">Captured by KAIRA, HackTech's AI Solutions Architect.</p>`;
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `KAIRA lead (${tier}) — ${name}`,
          html,
        }),
      });
      emailOk = r.ok;
      // A rejected send (bad key, quota, unverified sender) returns a non-2xx
      // rather than throwing, so it has to be checked explicitly.
      if (!r.ok) console.error("kaira-lead: Resend rejected the send, status " + r.status);
    } catch (e) {
      console.error("kaira-lead: Resend request failed —", (e && e.message) || e);
    }
  }

  // store in the CRM (Supabase) — awaited so it completes before the response.
  // The event row is written even when the lead row fails: the gap between
  // count(leads) and count(events where type='lead') is what surfaces a
  // persistence problem, so it is deliberately kept as a health signal.
  const row = {
    name,
    email,
    company: b.company || null,
    industry: b.industry || null,
    budget: b.budget || null,
    timeline: b.timeline || null,
    tier,
    context: (b.context || "").slice(0, 4000),
  };

  // Retry once. Observed losses were transient: a write succeeded and another
  // failed 11 minutes later with no schema change between them, so a single
  // retry covers the realistic failure mode. A persistent fault still falls
  // through to the 502 below rather than being retried indefinitely.
  let dbOk = await sb.insert("leads", row);
  if (!dbOk) {
    console.error("kaira-lead: Supabase lead insert failed for " + email + ", retrying");
    await new Promise((r) => setTimeout(r, 400));
    dbOk = await sb.insert("leads", row);
    if (!dbOk) console.error("kaira-lead: Supabase lead insert failed again for " + email);
  }
  await sb.insert("events", { type: "lead", label: tier });

  // If neither the inbox nor the database captured it, the lead is gone.
  // Say so rather than showing a success the visitor can't act on — the
  // widget surfaces this message and re-enables the submit button.
  if (!emailOk && !dbOk) {
    return res.status(502).json({
      ok: false,
      error: "We couldn't save your details just now. Please try again, or email contact.hacktechzone@gmail.com.",
    });
  }

  return res.status(200).json({ ok: true, tier });
};

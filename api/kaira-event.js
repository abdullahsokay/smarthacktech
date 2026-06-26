/* ============================================================
   KAIRA — lightweight event beacon (for analytics)
   The widget fires { type: "open" } when the panel opens.
   Only whitelisted types are stored.
   ============================================================ */
const sb = require("./_supabase");
const rl = require("./_ratelimit");

const ALLOWED = { open: true };

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (rl.limited("event", req, 30, 60000)) return res.status(204).end();
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const type = (body.type || "").toString();
  if (!ALLOWED[type]) return res.status(204).end();

  await sb.insert("events", { type });
  return res.status(200).json({ ok: true });
};

/* ============================================================
   KAIRA — Admin API (password-gated, server-side)
   Validates ADMIN_PASSWORD, then returns CRM data + analytics
   from Supabase (queried with the service_role key).
   Env: ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_KEY
   ============================================================ */
const sb = require("./_supabase");
const rl = require("./_ratelimit");
const crypto = require("crypto");

// constant-time compare — avoids leaking the password via response timing
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ab, bb); } catch { return false; }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // throttle login attempts (brute-force protection)
  if (rl.limited("admin", req, 8, 60000)) {
    return res.status(429).json({ error: "Too many attempts — please wait a minute." });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return res.status(503).json({ error: "Admin isn't configured (set ADMIN_PASSWORD)." });
  if (!safeEqual((body.password || "").toString(), expected)) {
    await new Promise((r) => setTimeout(r, 500)); // deliberate delay slows brute-force
    return res.status(401).json({ error: "Incorrect password." });
  }
  if (!sb.configured()) return res.status(503).json({ error: "Supabase isn't configured yet." });

  try {
    // The recent-leads table is a display list, so a capped fetch is fine here.
    const leads = await sb.select("leads?select=*&order=created_at.desc&limit=300");

    // Empty 7-day skeleton so days with no leads still plot as zero.
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      trend.push({ day: d.slice(5), count: 0 });
    }
    const idx = {};
    trend.forEach((t, i) => (idx[t.day] = i));

    let stats;
    try {
      // Preferred path: aggregate in Postgres, so totals stay exact at any size.
      // Needs supabase/migrations/20260722090000_stats_views_and_constraints.sql.
      // Counting rows in JS instead caps the
      // lead total at the fetch limit, and the unordered events fetch returns
      // an arbitrary subset once the table exceeds it.
      const [ev] = await sb.select("kaira_event_totals?select=*");
      const [ld] = await sb.select("kaira_lead_totals?select=*");
      const tr = await sb.select("kaira_lead_trend?select=*");
      const n = (v) => Number(v) || 0;

      stats = {
        opens: n(ev.opens), messages: n(ev.messages),
        blueprints: n(ev.blueprints), audits: n(ev.audits),
        leads: n(ld.total), Hot: n(ld.hot), Warm: n(ld.warm), Cold: n(ld.cold),
      };
      tr.forEach((r) => {
        const d = String(r.day || "").slice(5, 10);
        if (idx[d] != null) trend[idx[d]].count = n(r.count);
      });
    } catch {
      // Fallback for a database where the migration has not been run yet.
      // Accurate below the limits; approximate above them.
      const events = await sb.select("events?select=type,created_at&order=created_at.desc&limit=10000");
      stats = { opens: 0, messages: 0, blueprints: 0, audits: 0, leads: leads.length, Hot: 0, Warm: 0, Cold: 0 };
      events.forEach((e) => {
        if (e.type === "open") stats.opens++;
        else if (e.type === "message") stats.messages++;
        else if (e.type === "blueprint") stats.blueprints++;
        else if (e.type === "audit") stats.audits++;
      });
      leads.forEach((l) => { if (stats[l.tier] != null) stats[l.tier]++; });
      leads.forEach((l) => {
        const d = (l.created_at || "").slice(5, 10);
        if (idx[d] != null) trend[idx[d]].count++;
      });
    }

    stats.conversion = stats.opens ? Math.round((stats.leads / stats.opens) * 100) : 0;

    return res.status(200).json({ ok: true, leads, stats, trend });
  } catch {
    return res.status(502).json({ error: "Couldn't load dashboard data." });
  }
};

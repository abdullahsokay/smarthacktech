/* ============================================================
   KAIRA — Website Analyzer (HackTech)
   Runs Google PageSpeed Insights (Lighthouse) on a URL, then has
   KAIRA write a professional audit (verdict + prioritized fixes).
   Optional env PAGESPEED_API_KEY for higher rate limits.
   ============================================================ */

const AUDIT_PROMPT = `You are KAIRA, HackTech's AI Solutions Architect, delivering a website audit. Given the PageSpeed/Lighthouse data, respond as JSON ONLY:
{
  "verdict": string,                       // 2 honest sentences on the overall state
  "recommendations": [ { "area": "Performance"|"SEO"|"Accessibility"|"UX/UI"|"Mobile"|"Security", "text": string } ]  // 5-8, specific + actionable, prioritized by impact
}
Be concrete and practical (not generic). Output ONLY the JSON object.`;

const sb = require("./_supabase");
const rl = require("./_ratelimit");

function pct(s) { return s == null ? null : Math.round(s * 100); }

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (rl.limited("audit", req, 5, 60000)) {
    return res.status(429).json({ error: "Too many requests — please slow down." });
  }

  let data = req.body;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = {}; } }
  data = data || {};

  let url = (data.url || "").trim();
  if (!url) return res.status(400).json({ error: "Please enter a website URL." });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  if (!/^https?:\/\/[^\s.]+\.[^\s]+/i.test(url)) {
    return res.status(400).json({ error: "That doesn't look like a valid URL." });
  }

  sb.insert("events", { type: "audit" });

  const psiKey = process.env.PAGESPEED_API_KEY;
  const psiUrl =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" +
    encodeURIComponent(url) +
    "&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices" +
    (psiKey ? "&key=" + psiKey : "");

  let psi;
  try {
    const r = await fetch(psiUrl);
    if (!r.ok) {
      return res.status(502).json({
        error: psiKey
          ? "Couldn't analyze that URL — check it's public and try again."
          : "Website Analyzer needs a PageSpeed API key. Ask HackTech to configure it.",
      });
    }
    psi = await r.json();
  } catch {
    return res.status(502).json({ error: "Couldn't reach the analyzer right now. Please retry." });
  }

  const lr = psi.lighthouseResult || {};
  const cats = lr.categories || {};
  const aud = lr.audits || {};
  const scores = {
    performance: pct(cats.performance && cats.performance.score),
    accessibility: pct(cats.accessibility && cats.accessibility.score),
    seo: pct(cats.seo && cats.seo.score),
    bestPractices: pct(cats["best-practices"] && cats["best-practices"].score),
  };
  const metrics = {
    lcp: aud["largest-contentful-paint"] && aud["largest-contentful-paint"].displayValue,
    fcp: aud["first-contentful-paint"] && aud["first-contentful-paint"].displayValue,
    tbt: aud["total-blocking-time"] && aud["total-blocking-time"].displayValue,
    cls: aud["cumulative-layout-shift"] && aud["cumulative-layout-shift"].displayValue,
    si: aud["speed-index"] && aud["speed-index"].displayValue,
  };
  const issues = Object.keys(aud)
    .map((k) => aud[k])
    .filter((a) => a && typeof a.score === "number" && a.score < 0.9 && a.title)
    .sort((a, b) => a.score - b.score)
    .slice(0, 6)
    .map((a) => ({ title: a.title }));

  // KAIRA narrative
  let verdict = "";
  let recommendations = [];
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const base = (process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, "");
      const model = process.env.OPENAI_MODEL || "llama-3.3-70b-versatile";
      const summary =
        "URL: " + (lr.finalUrl || url) +
        "\nScores (0-100): Performance " + scores.performance + ", Accessibility " + scores.accessibility +
        ", SEO " + scores.seo + ", Best Practices " + scores.bestPractices +
        "\nMetrics: LCP " + metrics.lcp + ", FCP " + metrics.fcp + ", TBT " + metrics.tbt + ", CLS " + metrics.cls +
        "\nFlagged checks: " + issues.map((i) => i.title).join("; ");
      const gr = await fetch(base + "/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: AUDIT_PROMPT },
            { role: "user", content: summary },
          ],
        }),
      });
      if (gr.ok) {
        const gj = await gr.json();
        const txt = (gj.choices && gj.choices[0] && gj.choices[0].message && gj.choices[0].message.content) || "{}";
        const parsed = JSON.parse(txt);
        verdict = parsed.verdict || "";
        recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      }
    } catch {
      /* narrative optional — scores still returned */
    }
  }

  return res.status(200).json({ url: lr.finalUrl || url, scores, metrics, issues, verdict, recommendations });
};

/* ============================================================
   Best-effort rate limiter (per warm serverless instance).
   Not bullet-proof across instances, but it stops casual abuse,
   bots, and accidental floods — raising the bar a lot.
   For hard guarantees, back this with Upstash/Redis later.
   ============================================================ */

const buckets = new Map();

function clientIp(req) {
  const h = (req && req.headers) || {};
  // x-real-ip is set by the Vercel edge to the true client IP (not client-spoofable).
  if (h["x-real-ip"]) return String(h["x-real-ip"]).trim();
  // Fallback: take the LAST x-forwarded-for entry (closest to our edge) to blunt
  // header-spoofing, since attackers can only prepend tokens, not append them.
  const parts = String(h["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "anon";
}

// returns true if the caller has exceeded `max` requests in `windowMs`
function limited(scope, req, max, windowMs) {
  const key = scope + ":" + clientIp(req);
  const now = Date.now();
  const e = buckets.get(key);
  if (!e || now - e.t > windowMs) {
    buckets.set(key, { n: 1, t: now });
    // opportunistic cleanup so the map can't grow unbounded
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now - v.t > windowMs) buckets.delete(k);
    }
    return false;
  }
  e.n += 1;
  return e.n > max;
}

module.exports = { limited, clientIp };

/* ============================================================
   Best-effort rate limiter (per warm serverless instance).
   Not bullet-proof across instances, but it stops casual abuse,
   bots, and accidental floods — raising the bar a lot.
   For hard guarantees, back this with Upstash/Redis later.
   ============================================================ */

const buckets = new Map();

function clientIp(req) {
  const xff = (req.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"])) || "";
  return String(xff).split(",")[0].trim() || "anon";
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

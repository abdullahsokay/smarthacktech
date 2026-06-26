/* ============================================================
   Supabase REST helper (server-side only).
   Uses the service_role key — never expose to the browser.
   Files starting with "_" are not treated as routes by Vercel.

   Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
   ============================================================ */

function base() {
  return (process.env.SUPABASE_URL || "").replace(/\/$/, "");
}
function key() {
  return process.env.SUPABASE_SERVICE_KEY || "";
}
function configured() {
  return !!(base() && key());
}

// Fire-and-forget insert; never throws (logging must not break the app).
async function insert(table, row) {
  if (!configured()) return false;
  try {
    const r = await fetch(base() + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        apikey: key(),
        Authorization: "Bearer " + key(),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    return r.ok;
  } catch {
    return false;
  }
}

// Query rows. `path` is a PostgREST path, e.g. "leads?select=*&order=created_at.desc&limit=200"
async function select(path) {
  if (!configured()) throw new Error("Supabase is not configured.");
  const r = await fetch(base() + "/rest/v1/" + path, {
    headers: { apikey: key(), Authorization: "Bearer " + key() },
  });
  if (!r.ok) throw new Error("Supabase query failed (" + r.status + ")");
  return r.json();
}

module.exports = { configured, insert, select };

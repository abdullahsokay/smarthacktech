/* ============================================================
   HackTech — contact/quote backend  (Vercel Serverless Function)
   POST /api/contact   →   emails the lead to your inbox via Resend.

   Zero dependencies: uses the global fetch in Vercel's Node runtime.

   Set in Vercel → Project → Settings → Environment Variables:
     RESEND_API_KEY   (required)  from https://resend.com  — free tier
     CONTACT_TO       (optional)  inbox for leads   — default hello@hacktech.pk
     CONTACT_FROM     (optional)  verified sender   — default onboarding@resend.dev
                                  (for production, verify hacktech.pk in Resend and
                                   set this to e.g. "HackTech <noreply@hacktech.pk>")

   Until RESEND_API_KEY is set, this returns 503 and the front-end
   gracefully falls back to the visitor's email client (mailto).
   ============================================================ */

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Vercel auto-parses JSON bodies; stay defensive if it arrives as a string.
  var data = req.body;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch (e) { data = {}; } }
  data = data || {};

  // honeypot: bots fill hidden fields, humans don't → silently accept & drop.
  if (data._gotcha) return res.status(200).json({ ok: true });

  var name = (data.name || "").toString().trim();
  var email = (data.email || "").toString().trim();
  var message = (data.message || "").toString().trim();
  var company = (data.company || "").toString().trim();
  var service = (data.service || "").toString().trim();

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Please fill in your name, email and message." });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "That email address doesn't look right." });
  }
  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return res.status(400).json({ ok: false, error: "One of those fields is too long." });
  }

  var apiKey = process.env.RESEND_API_KEY;
  var to = process.env.CONTACT_TO || "hello@hacktech.pk";
  var from = process.env.CONTACT_FROM || "HackTech Website <onboarding@resend.dev>";

  // Not wired up yet → let the browser fall back to mailto.
  if (!apiKey) {
    return res.status(503).json({ ok: false, error: "Email service not configured yet." });
  }

  var esc = function (s) {
    return String(s).replace(/[<>&]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]; });
  };
  var subject = "New enquiry — " + (service || "HackTech") + " — " + name;
  var html =
    "<h2>New website enquiry</h2>" +
    "<p><b>Name:</b> " + esc(name) + "</p>" +
    "<p><b>Email:</b> " + esc(email) + "</p>" +
    (company ? "<p><b>Company:</b> " + esc(company) + "</p>" : "") +
    (service ? "<p><b>Service:</b> " + esc(service) + "</p>" : "") +
    "<p><b>Message:</b></p><p>" + esc(message).replace(/\n/g, "<br>") + "</p>" +
    "<hr><p style='color:#888;font-size:12px'>Sent from the HackTech website contact form.</p>";

  try {
    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: email,          // hitting "Reply" answers the customer directly
        subject: subject,
        html: html
      })
    });
    if (!r.ok) {
      var detail = await r.text().catch(function () { return ""; });
      console.error("Resend error", r.status, detail);
      return res.status(502).json({ ok: false, error: "Could not send right now. Please email " + to + "." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact handler error", err);
    return res.status(500).json({ ok: false, error: "Unexpected error. Please email " + to + "." });
  }
};

import type { LeadTier } from "@/lib/types";

export const runtime = "nodejs";

interface LeadBody {
  name?: string;
  email?: string;
  whatsapp?: string;
  company?: string;
  budget?: string;
  timeline?: string;
  projectName?: string;
  summary?: string;
}

function classify(b: LeadBody): LeadTier {
  let score = 0;
  const budget = (b.budget || "").toLowerCase();
  const timeline = (b.timeline || "").toLowerCase();

  if (/(lakh|crore|million|[5-9]\dk|\d{2,}\s*k|\$\s*\d{4,}|enterprise|high)/.test(budget)) score += 2;
  else if (/(\dk|medium|mid|\$\s*\d{3,})/.test(budget)) score += 1;

  if (/(urgent|asap|immediately|this month|1\s*month|2\s*week|now)/.test(timeline)) score += 2;
  else if (/(month|quarter|soon|6\s*week)/.test(timeline)) score += 1;

  if (b.whatsapp && b.whatsapp.trim().length >= 7) score += 1;
  if (b.company && b.company.trim().length > 1) score += 1;

  if (score >= 4) return "Hot";
  if (score >= 2) return "Warm";
  return "Cold";
}

function esc(s: string) {
  return String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}

export async function POST(req: Request) {
  let b: LeadBody;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const name = (b.name || "").trim();
  const email = (b.email || "").trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json(
      { error: "Please share your name and a valid email." },
      { status: 400 }
    );
  }

  const tier = classify(b);

  // Optional: email the lead to HackTech via Resend (if configured).
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const to = process.env.CONTACT_TO || "hello@hacktech.pk";
    const from = process.env.CONTACT_FROM || "VEYRA <onboarding@resend.dev>";
    const html =
      `<h2>New VEYRA lead — <b>${esc(tier)}</b></h2>` +
      `<p><b>Name:</b> ${esc(name)}</p>` +
      `<p><b>Email:</b> ${esc(email)}</p>` +
      (b.whatsapp ? `<p><b>WhatsApp:</b> ${esc(b.whatsapp)}</p>` : "") +
      (b.company ? `<p><b>Company:</b> ${esc(b.company)}</p>` : "") +
      (b.budget ? `<p><b>Budget:</b> ${esc(b.budget)}</p>` : "") +
      (b.timeline ? `<p><b>Timeline:</b> ${esc(b.timeline)}</p>` : "") +
      (b.projectName ? `<p><b>Project:</b> ${esc(b.projectName)}</p>` : "") +
      (b.summary ? `<p><b>Summary:</b><br>${esc(b.summary)}</p>` : "") +
      `<hr><p style="color:#888;font-size:12px">Captured by VEYRA, HackTech's AI Solutions Architect.</p>`;
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `VEYRA lead (${tier}) — ${name}${b.projectName ? " · " + b.projectName : ""}`,
          html,
        }),
      });
    } catch {
      // non-fatal — we still acknowledge the lead
    }
  }

  return Response.json({ ok: true, tier });
}

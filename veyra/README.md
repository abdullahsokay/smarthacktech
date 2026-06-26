# VEYRA — AI Solutions Architect (HackTech)

Not a chatbot. A digital solutions architect. Describe an idea → get a system
architecture, a complexity estimate, and a proposal. Built with Next.js 16,
React 19, TypeScript, Tailwind v4 and the OpenAI API.

**Tagline:** Design. Estimate. Plan. Build.

## What it does (MVP — Phase 1)
- **Floating AI orb** landing → click (or type) to enter a full-screen consultation workspace.
- **Project Discovery** — VEYRA asks smart follow-ups (goal, audience, features, timeline, budget) instead of answering blindly.
- **Solution Architect + Live diagram** — `Generate Blueprint` produces system architecture (animated flow), recommended stack, security & scalability.
- **Estimation** — complexity score, timeline, team size, phases, risks, and a professional **budget range** (never an exact price).
- **Proposal** — overview, scope, deliverables, next steps. Copy or download as Markdown.
- **Lead capture** — name/email/WhatsApp/company/budget/timeline, auto-classified **Hot / Warm / Cold**, optionally emailed to HackTech.
- **Streaming** replies, **EN/Urdu/Roman-Urdu** (mirrors the user), rate-limit + cost guard, graceful fallback if no key.

## Run it locally
1. Add your key:
   ```bash
   cp .env.local.example .env.local
   # then edit .env.local and set OPENAI_API_KEY=sk-...
   ```
   The key stays **server-side only** — it is never shipped to the browser.
2. Install + run:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000

Without a key the UI still loads; the AI routes return a graceful "not configured" message.

## Environment variables
| Var | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | The reasoning engine |
| `OPENAI_MODEL` | optional | Default `gpt-4o-mini` (cheap + capable) |
| `RESEND_API_KEY` | optional | Email leads to your inbox |
| `CONTACT_TO` / `CONTACT_FROM` | optional | Lead email routing |

## Deploy (Vercel)
- Import this `veyra/` folder as a **separate Vercel project**.
- Add the env vars above in Project → Settings → Environment Variables.
- The HackTech homepage orb will link to this deployment.

## Cost & safety
- OpenAI bills per request. A full consultation costs ~cents on `gpt-4o-mini`.
- A best-effort in-memory rate limit is included; for production scale, back it with Upstash/Redis.

## Roadmap (next phases)
- React Flow / Three.js upgrades for the architecture diagram + 3D orb
- Website Auditor (PageSpeed API + AI commentary)
- Supabase: lead storage, auth, **admin dashboard** + analytics
- RAG knowledge base over HackTech's services
- Voice mode, shareable proposal links, styled PDF export

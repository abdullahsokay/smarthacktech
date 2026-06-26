"use client";

import { useEffect, useRef, useState } from "react";
import type { Blueprint, LeadTier, Msg } from "@/lib/types";
import BlueprintView from "@/components/Blueprint";

const GREETING =
  "Hi — I'm VEYRA, HackTech's AI Solutions Architect. I turn an idea into clarity: the right architecture, an honest estimate, and a proposal you can act on.\n\nSo, what are you building today?";

const STARTERS = [
  "I need a website for my business",
  "An AI chatbot for customer support",
  "A fleet / IoT tracking system",
  "A mobile app — not sure where to start",
];

export default function Veyra() {
  const [phase, setPhase] = useState<"landing" | "workspace">("landing");
  const [starter, setStarter] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [generating, setGenerating] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  const messagesRef = useRef<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesRef.current = messages;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function streamConsult(history: Msg[]) {
    const res = await fetch("/api/consult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    if (!res.ok || !res.body) {
      let msg = "VEYRA is unavailable right now.";
      try {
        const j = await res.json();
        msg = j.error || msg;
      } catch {}
      throw new Error(msg);
    }
    return res.body.getReader();
  }

  async function runTurn(history: Msg[]) {
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);
    setError("");
    try {
      const reader = await streamConsult(history);
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages((m) =>
        m.filter((x, i) => !(i === m.length - 1 && x.role === "assistant" && x.content === ""))
      );
    } finally {
      setStreaming(false);
    }
  }

  function send(text: string) {
    const clean = text.trim();
    if (!clean || streaming) return;
    const history: Msg[] = [...messagesRef.current, { role: "user", content: clean }];
    setInput("");
    runTurn(history);
  }

  function enterWorkspace(seedText?: string) {
    const seed: Msg[] = [{ role: "assistant", content: GREETING }];
    messagesRef.current = seed;
    setMessages(seed);
    setPhase("workspace");
    const s = (seedText ?? starter).trim();
    if (s) {
      setStarter("");
      const history: Msg[] = [...seed, { role: "user", content: s }];
      setTimeout(() => runTurn(history), 80);
    }
  }

  async function generateBlueprint() {
    if (generating) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate the blueprint.");
      setBlueprint(data as Blueprint);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Blueprint failed.");
    } finally {
      setGenerating(false);
    }
  }

  const canBlueprint = messages.filter((m) => m.role === "user").length >= 1 && !streaming;

  /* ---------------- LANDING ---------------- */
  if (phase === "landing") {
    return (
      <main className="veyra">
        <div className="bg" />
        <section className="landing">
          <div className="landing__in">
            <span className="brandline">
              <b>VEYRA</b> · AI Solutions Architect
            </span>

            <button className="orb" aria-label="Start a consultation with VEYRA" onClick={() => enterWorkspace()}>
              <span className="orb__glow" />
              <span className="orb__ring" />
              <span className="orb__ring" />
              <span className="orb__ring" />
              <span className="orb__core" />
            </button>

            <h1 className="landing__title">
              Design. Estimate. <span>Plan. Build.</span>
            </h1>
            <p className="landing__tag">
              Describe your idea. Walk away with a system architecture, a realistic estimate, and a proposal — in minutes.
            </p>

            <form
              className="starter"
              onSubmit={(e) => {
                e.preventDefault();
                enterWorkspace();
              }}
            >
              <input
                value={starter}
                onChange={(e) => setStarter(e.target.value)}
                placeholder="What are you building today?"
                aria-label="What are you building today?"
              />
              <button className="btn btn--ai btn--send" type="submit" aria-label="Begin">
                <Arrow />
              </button>
            </form>

            <div className="actions" style={{ justifyContent: "center" }}>
              {STARTERS.map((s) => (
                <button key={s} className="chip" onClick={() => enterWorkspace(s)} type="button">
                  {s}
                </button>
              ))}
            </div>
            <p className="landing__cta">Click the orb or just start typing</p>
          </div>
        </section>
      </main>
    );
  }

  /* ---------------- WORKSPACE ---------------- */
  return (
    <main className="veyra">
      <div className="bg" />
      <div className="ws">
        <header className="ws__head">
          <div className="ws__brand">
            <span className="dot-orb" />
            <div>
              <b>VEYRA</b>
              <span>AI Solutions Architect · HackTech</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn btn--ghost" onClick={() => setLeadOpen(true)}>
              Talk to a human
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setMessages([]);
                setBlueprint(null);
                setPhase("landing");
              }}
            >
              New
            </button>
          </div>
        </header>

        <div className={`ws__main${blueprint ? " has-panel" : ""}`}>
          <section className={`ws__convo${blueprint ? " dim" : ""}`}>
            <div className="thread">
              <div className="thread__in">
                {messages.map((m, i) => (
                  <div key={i} className={`msg msg--${m.role === "user" ? "user" : "veyra"}`}>
                    <span className="msg__av">{m.role === "user" ? "You" : "V"}</span>
                    <div className="msg__body">
                      {m.content || (streaming && i === messages.length - 1 ? <Dots /> : "")}
                    </div>
                  </div>
                ))}
                {error && <div className="err">{error}</div>}
                <div ref={endRef} />
              </div>
            </div>

            <div className="composer">
              <div className="composer__in">
                <div className="composer__row">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Tell VEYRA more…"
                    rows={1}
                  />
                  <button
                    className="btn btn--ai btn--send"
                    onClick={() => send(input)}
                    disabled={streaming || !input.trim()}
                    aria-label="Send"
                  >
                    <Arrow />
                  </button>
                </div>
                <div className="actions">
                  <button className="btn btn--gold" onClick={generateBlueprint} disabled={!canBlueprint || generating}>
                    {generating ? "Designing blueprint…" : "✦ Generate Blueprint"}
                  </button>
                  {blueprint && (
                    <button className="btn btn--ghost" onClick={() => setBlueprint(blueprint)}>
                      View blueprint
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {blueprint && (
            <BlueprintView
              bp={blueprint}
              onClose={() => setBlueprint(null)}
              onRegenerate={generateBlueprint}
              onTalk={() => setLeadOpen(true)}
            />
          )}
        </div>
      </div>

      {leadOpen && (
        <LeadModal
          projectName={blueprint?.projectName}
          summary={blueprint?.summary}
          onClose={() => setLeadOpen(false)}
        />
      )}
    </main>
  );
}

/* ---------------- Lead modal ---------------- */
function LeadModal({
  projectName,
  summary,
  onClose,
}: {
  projectName?: string;
  summary?: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    company: "",
    budget: "",
    timeline: "",
  });
  const [busy, setBusy] = useState(false);
  const [tier, setTier] = useState<LeadTier | null>(null);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectName, summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      setTier(data.tier as LeadTier);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(4,4,8,.66)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "min(440px,94vw)", margin: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {tier ? (
          <div style={{ textAlign: "center", padding: "8px 4px" }}>
            <div className={`tier tier--${tier}`} style={{ marginBottom: 12 }}>
              {tier} lead
            </div>
            <h3 style={{ marginBottom: 8 }}>You're in good hands.</h3>
            <p className="panel__summary" style={{ marginTop: 0 }}>
              VEYRA has briefed the HackTech team. A specialist will reach out shortly to take this forward.
            </p>
            <button className="btn btn--ai" style={{ marginTop: 14 }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="lead" onSubmit={submit}>
            <div className="panel__eyebrow">Connect with HackTech</div>
            <h3 style={{ marginBottom: 4 }}>Let&apos;s make it real</h3>
            <p className="panel__summary" style={{ marginTop: 0, marginBottom: 6 }}>
              Share your details — VEYRA will brief a HackTech specialist on your project.
            </p>
            <div className="lead__row">
              <div className="field">
                <input placeholder="Full name" value={form.name} onChange={set("name")} required />
              </div>
              <div className="field">
                <input placeholder="Email" type="email" value={form.email} onChange={set("email")} required />
              </div>
            </div>
            <div className="lead__row">
              <div className="field">
                <input placeholder="WhatsApp (optional)" value={form.whatsapp} onChange={set("whatsapp")} />
              </div>
              <div className="field">
                <input placeholder="Company (optional)" value={form.company} onChange={set("company")} />
              </div>
            </div>
            <div className="lead__row">
              <div className="field">
                <select value={form.budget} onChange={set("budget")}>
                  <option value="">Budget range</option>
                  <option>Under PKR 100k / $500</option>
                  <option>PKR 100k–500k / $500–2k</option>
                  <option>PKR 500k–2m / $2k–8k</option>
                  <option>PKR 2m+ / $8k+ (enterprise)</option>
                </select>
              </div>
              <div className="field">
                <select value={form.timeline} onChange={set("timeline")}>
                  <option value="">Timeline</option>
                  <option>ASAP / this month</option>
                  <option>1–3 months</option>
                  <option>3–6 months</option>
                  <option>Just exploring</option>
                </select>
              </div>
            </div>
            {err && <div className="err">{err}</div>}
            <button className="btn btn--ai" type="submit" disabled={busy} style={{ justifyContent: "center" }}>
              {busy ? "Sending…" : "Send to HackTech"}
            </button>
            <p className="note">Your details are sent only to HackTech. No spam.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="dots" aria-label="VEYRA is thinking">
      <i />
      <i />
      <i />
    </span>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

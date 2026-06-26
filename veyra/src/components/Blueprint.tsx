"use client";

import type { Blueprint } from "@/lib/types";

function toMarkdown(bp: Blueprint): string {
  const L = (arr: string[]) => arr.map((x) => `- ${x}`).join("\n");
  return `# ${bp.projectName}

${bp.summary}

## Architecture
${bp.architecture.map((n) => `- **${n.layer}** — ${n.tech}: ${n.note}`).join("\n")}

## Technology Stack
- Frontend: ${bp.stack.frontend}
- Backend: ${bp.stack.backend}
- Database: ${bp.stack.database}
- AI: ${bp.stack.ai}
- Infrastructure: ${bp.stack.infrastructure}

## Security
${L(bp.security)}

## Scalability
${L(bp.scalability)}

## Estimation
- Complexity: ${bp.estimation.complexityScore}/10 (${bp.estimation.complexityLabel})
- Timeline: ${bp.estimation.timeline}
- Team: ${bp.estimation.teamSize}
- Budget range: ${bp.estimation.budgetRange}

### Phases
${bp.estimation.phases.map((p) => `- **${p.name}** (${p.weeks}): ${p.focus}`).join("\n")}

### Risk factors
${L(bp.estimation.risks)}

## Proposal
${bp.proposal.overview}

### Scope
${L(bp.proposal.scope)}

### Deliverables
${L(bp.proposal.deliverables)}

### Next steps
${L(bp.proposal.nextSteps)}

---
Prepared by VEYRA — HackTech's AI Solutions Architect.`;
}

export default function Blueprint({
  bp,
  onRegenerate,
  onClose,
  onTalk,
}: {
  bp: Blueprint;
  onRegenerate: () => void;
  onClose: () => void;
  onTalk: () => void;
}) {
  const copy = () => navigator.clipboard?.writeText(toMarkdown(bp));
  const download = () => {
    const blob = new Blob([toMarkdown(bp)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bp.projectName.replace(/[^\w]+/g, "-").toLowerCase()}-proposal.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pct = Math.max(0, Math.min(10, bp.estimation.complexityScore)) * 10;

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <div className="panel__eyebrow">Project Blueprint</div>
          <h2 className="panel__title">{bp.projectName}</h2>
          <p className="panel__summary">{bp.summary}</p>
        </div>
        <button className="icon-btn" aria-label="Close blueprint" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Architecture */}
      <div className="card">
        <div className="card__label">System Architecture</div>
        <div className="diagram">
          {bp.architecture.map((n, i) => (
            <div key={i}>
              <div className="node" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="node__dot" />
                <div>
                  <div className="node__layer">{n.layer}</div>
                  <div className="node__tech">{n.tech}</div>
                  <div className="node__note">{n.note}</div>
                </div>
              </div>
              {i < bp.architecture.length - 1 && <div className="flow" />}
            </div>
          ))}
        </div>
      </div>

      {/* Stack */}
      <div className="card">
        <div className="card__label">Technology Stack</div>
        <div className="grid2">
          <div className="kv"><b>Frontend</b><span>{bp.stack.frontend}</span></div>
          <div className="kv"><b>Backend</b><span>{bp.stack.backend}</span></div>
          <div className="kv"><b>Database</b><span>{bp.stack.database}</span></div>
          <div className="kv"><b>AI</b><span>{bp.stack.ai}</span></div>
          <div className="kv"><b>Infrastructure</b><span>{bp.stack.infrastructure}</span></div>
        </div>
      </div>

      {/* Security + Scalability */}
      <div className="card">
        <div className="card__label">Security</div>
        <ul className="list">{bp.security.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>
      <div className="card">
        <div className="card__label">Scalability</div>
        <ul className="list">{bp.scalability.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>

      {/* Estimation */}
      <div className="card">
        <div className="card__label">Project Estimation</div>
        <div className="kpis">
          <div className="kpi"><b>{bp.estimation.complexityScore}/10</b><span>{bp.estimation.complexityLabel}</span></div>
          <div className="kpi"><b>{bp.estimation.timeline}</b><span>Timeline</span></div>
          <div className="kpi"><b>{bp.estimation.teamSize}</b><span>Team</span></div>
        </div>
        <div className="gauge"><i style={{ width: `${pct}%` }} /></div>
        <div className="kv" style={{ marginBottom: 14 }}>
          <b>Indicative Budget Range</b>
          <span>{bp.estimation.budgetRange}</span>
        </div>
        <div className="card__label">Phases</div>
        {bp.estimation.phases.map((p, i) => (
          <div className="phase" key={i}>
            <span className="phase__n">{i + 1}</span>
            <div>
              <div className="phase__t">{p.name} <span className="phase__w">· {p.weeks}</span></div>
              <div className="phase__f">{p.focus}</div>
            </div>
          </div>
        ))}
        <div className="card__label" style={{ marginTop: 16 }}>Risk factors</div>
        <ul className="list">{bp.estimation.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>

      {/* Proposal */}
      <div className="card">
        <div className="card__label">Proposal</div>
        <p className="panel__summary" style={{ marginTop: 0 }}>{bp.proposal.overview}</p>
        <div className="card__label" style={{ marginTop: 14 }}>Scope</div>
        <ul className="list">{bp.proposal.scope.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <div className="card__label" style={{ marginTop: 14 }}>Deliverables</div>
        <ul className="list">{bp.proposal.deliverables.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <div className="card__label" style={{ marginTop: 14 }}>Next steps</div>
        <ul className="list">{bp.proposal.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>

      <div className="actions" style={{ justifyContent: "center", margin: "4px 0 20px" }}>
        <button className="btn btn--ai" onClick={onTalk}>Talk to a HackTech expert</button>
        <button className="btn btn--ghost" onClick={download}>Download proposal</button>
        <button className="btn btn--ghost" onClick={copy}>Copy</button>
        <button className="btn btn--ghost" onClick={onRegenerate}>Regenerate</button>
      </div>
    </div>
  );
}

/* ============================================================
   KAIRA — on-site AI assistant (HackTech)
   Energy-orb welcome screen → streaming chat. The 3D robot
   (kaira-robot.js) mounts into #kaira-stage. Chat → /api/veyra.
   ============================================================ */
(function () {
  "use strict";
  if (window.__kaira) return;
  window.__kaira = true;

  var STARTERS = [
    { l: "🚀 Build a Website", m: "I want to build a website." },
    { l: "📱 Mobile App", m: "I want to build a mobile app." },
    { l: "🤖 AI Product", m: "I want to build an AI product." },
    { l: "🌐 IoT Platform", m: "I want to build an IoT platform." },
    { l: "🔐 Security & CCTV", m: "I need a security & CCTV system." },
    { l: "🏠 Smart Home", m: "I want smart home automation." },
    { l: "📊 Business Software", m: "I need custom business software." },
    { l: "💰 Estimate Project", m: "Help me estimate my project — ask me what you need to know." },
    { l: "📄 Generate Proposal", m: "I'd like a proposal for my project." },
    { l: "📅 Book Consultation", m: "", a: "lead" },
    { l: "🔍 Website Audit", m: "", a: "audit" },
  ];
  var ARROW =
    '<svg class="vy-send__arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var root = document.createElement("div");
  root.className = "vy";
  root.innerHTML =
    '<button class="vy-launch" type="button" aria-label="Chat with Kaira, HackTech\'s AI assistant">' +
      '<span class="vy-launch__glow" aria-hidden="true"></span>' +
      '<span class="vy-launch__stage" id="kaira-stage" aria-hidden="true"></span>' +
      '<span class="vy-launch__orb" aria-hidden="true"></span>' +
      '<span class="vy-launch__tip">Ask <b>Kaira</b></span>' +
    "</button>" +
    '<section class="vy-panel" role="dialog" aria-label="Kaira — HackTech AI assistant" aria-modal="false">' +
      '<div class="vy-top">' +
        '<span class="vy-top__brand"><i></i> KAIRA</span>' +
        '<div class="vy-top__tools">' +
          '<button class="vy-refresh" type="button" aria-label="New chat" title="New chat">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>' +
          "</button>" +
          '<button class="vy-x" type="button" aria-label="Close chat">✕</button>' +
        "</div>" +
      "</div>" +
      '<div class="vy-main">' +
        '<div class="vy-welcome">' +
          '<div class="vy-orb" aria-hidden="true">' +
            '<span class="vy-orb__glow"></span>' +
            '<span class="vy-orb__ball"><span class="vy-orb__swirl"></span><span class="vy-orb__rim"></span><span class="vy-orb__hi"></span></span>' +
          "</div>" +
          '<div class="vy-hello">I&rsquo;m KAIRA — your AI Solutions Architect</div>' +
          '<h2 class="vy-ask">How can I help you <span>today</span>?</h2>' +
          '<div class="vy-chips"></div>' +
        "</div>" +
        '<div class="vy-thread"></div>' +
      "</div>" +
      '<div class="vy-foot">' +
        '<div class="vy-actions"><button class="vy-act" id="vyBp" type="button">✦ Generate Blueprint</button></div>' +
        '<div class="vy-row">' +
          '<input type="text" placeholder="Ask anything…" aria-label="Message Kaira">' +
          '<button class="vy-send" type="button" aria-label="Send">' +
            '<span class="vy-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' + ARROW +
          "</button>" +
        "</div>" +
        '<div class="vy-foot__cta">' +
          '<a class="vy-expert" href="contact.html">Talk to a HackTech expert →</a>' +
          '<span class="vy-foot__note">Powered by HackTech AI</span>' +
        "</div>" +
      "</div>" +
    "</section>";
  document.body.appendChild(root);

  var panel = root.querySelector(".vy-panel");
  var launch = root.querySelector(".vy-launch");
  var closeBtn = root.querySelector(".vy-x");
  var thread = root.querySelector(".vy-thread");
  var chipsWrap = root.querySelector(".vy-chips");
  var row = root.querySelector(".vy-row");
  var ta = root.querySelector(".vy-row input");
  var sendBtn = root.querySelector(".vy-send");
  var bpBtn = root.querySelector("#vyBp");
  var refreshBtn = root.querySelector(".vy-refresh");

  var messages = [];
  var streaming = false;
  var started = false;
  var generating = false;
  var tracked = false;
  var session = 0;   // bumped on reset → invalidates any in-flight reply

  STARTERS.forEach(function (s) {
    var b = document.createElement("button");
    b.className = "vy-chip";
    b.type = "button";
    b.textContent = s.l;
    b.addEventListener("click", function () {
      if (s.a === "lead") openLeadForm();
      else if (s.a === "audit") openAuditForm();
      else send(s.m);
    });
    chipsWrap.appendChild(b);
  });

  function scrollDown() { thread.scrollTop = thread.scrollHeight; }

  function bubble(role, text) {
    var wrap = document.createElement("div");
    wrap.className = "vy-msg vy-msg--" + (role === "user" ? "user" : "kaira");
    var av = document.createElement("span");
    av.className = "vy-msg__av";
    av.textContent = role === "user" ? "You" : "K";
    var body = document.createElement("div");
    body.className = "vy-msg__body";
    body.textContent = text || "";
    wrap.appendChild(av);
    wrap.appendChild(body);
    thread.appendChild(wrap);
    scrollDown();
    return body;
  }

  function open() {
    root.classList.add("is-open");
    startTypewriter();
    if (!tracked) {
      tracked = true;
      try {
        fetch("/api/kaira-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "open" }),
          keepalive: true,
        }).catch(function () {});
      } catch (e) {}
    }
    setTimeout(function () { ta.focus(); }, 120);
  }
  function close() { root.classList.remove("is-open"); }

  // Reset to a fresh conversation (the refresh button). Invalidates any reply
  // still streaming so it can't repopulate the cleared thread.
  function resetChat() {
    session++;
    messages.length = 0;
    thread.innerHTML = "";
    started = false; streaming = false; generating = false;
    panel.classList.remove("is-chatting");
    ta.value = "";
    autosize();
    sendBtn.disabled = false;
    bpBtn.disabled = false;
    ta.focus();
  }
  window.KairaChat = { open: open, close: close, reset: resetChat };

  function autosize() {
    row.classList.toggle("has-text", !!ta.value.trim());
  }

  async function send(text) {
    text = (text || "").trim();
    if (!text || streaming) return;
    if (!started) { started = true; panel.classList.add("is-chatting"); }
    var sid = session;

    messages.push({ role: "user", content: text });
    bubble("user", text);
    ta.value = "";
    autosize();

    var body = bubble("kaira", "");
    body.innerHTML = '<span class="vy-dots"><i></i><i></i><i></i></span>';
    streaming = true;
    sendBtn.disabled = true;
    scrollDown();

    try {
      var res = await fetch("/api/veyra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.slice(-16) }),
      });
      if (!res.ok || !res.body) {
        var e = {};
        try { e = await res.json(); } catch (x) {}
        throw new Error(e.error || "Kaira is unavailable right now.");
      }
      var reader = res.body.getReader();
      var dec = new TextDecoder();
      var acc = "";
      body.textContent = "";
      for (;;) {
        var r = await reader.read();
        if (r.done) break;
        if (sid !== session) { try { reader.cancel(); } catch (e) {} return; }
        acc += dec.decode(r.value, { stream: true });
        body.textContent = acc;
        scrollDown();
      }
      if (sid === session) messages.push({ role: "assistant", content: acc || "…" });
    } catch (err) {
      if (sid !== session) return;
      if (body.parentNode) body.parentNode.remove();
      var er = document.createElement("div");
      er.className = "vy-err";
      er.textContent = (err && err.message) || "Something went wrong. Please try again.";
      thread.appendChild(er);
      scrollDown();
    } finally {
      if (sid === session) {
        streaming = false;
        sendBtn.disabled = false;
        ta.focus();
      }
    }
  }

  // ---------- Blueprint engine ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[<>&]/g, function (c) {
      return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c];
    });
  }
  function li(arr) {
    return (Array.isArray(arr) ? arr : []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
  }

  async function generateBlueprint() {
    if (streaming || generating) return;
    if (messages.filter(function (m) { return m.role === "user"; }).length === 0) {
      send("I'd like a full blueprint — here's my project idea: ");
      return;
    }
    if (!started) { started = true; panel.classList.add("is-chatting"); }
    generating = true;
    bpBtn.disabled = true;
    var sid = session;
    var loading = bubble("kaira", "");
    loading.innerHTML = 'Designing your blueprint — architecture, stack, estimate &amp; proposal… <span class="vy-dots"><i></i><i></i><i></i></span>';
    scrollDown();
    try {
      var res = await fetch("/api/kaira-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.slice(-24) }),
      });
      var bp = await res.json();
      if (sid !== session) return;
      if (!res.ok) throw new Error(bp.error || "Couldn't generate the blueprint.");
      if (loading.parentNode) loading.parentNode.remove();
      renderBlueprint(bp);
    } catch (err) {
      if (sid !== session) return;
      loading.textContent = (err && err.message) || "Blueprint failed. Please try again.";
    } finally {
      if (sid === session) {
        generating = false;
        bpBtn.disabled = false;
      }
    }
  }

  function buildBlueprintHTML(bp) {
    var arch = (bp.architecture || []).map(function (n, i) {
      return '<div class="vy-node" style="animation-delay:' + (i * 0.08).toFixed(2) + 's">' +
        '<span class="vy-node__dot"></span><div><div class="vy-node__layer">' + esc(n.layer) +
        '</div><div class="vy-node__tech">' + esc(n.tech) + '</div><div class="vy-node__note">' + esc(n.note) +
        "</div></div></div>" + (i < bp.architecture.length - 1 ? '<div class="vy-flow"></div>' : "");
    }).join("");
    var st = bp.stack || {};
    var e = bp.estimation || {};
    var pct = Math.max(0, Math.min(10, +e.complexityScore || 0)) * 10;
    var phases = (e.phases || []).map(function (p, i) {
      return '<div class="vy-phase"><span class="vy-phase__n">' + (i + 1) + '</span><div><div class="vy-phase__t">' +
        esc(p.name) + ' <span class="vy-phase__w">· ' + esc(p.weeks) + '</span></div><div class="vy-phase__f">' +
        esc(p.focus) + "</div></div></div>";
    }).join("");
    var pr = bp.proposal || {};
    return '<div class="vy-bp__head"><div class="vy-bp__eyebrow">✦ Project Blueprint</div>' +
      '<h3 class="vy-bp__title">' + esc(bp.projectName || "Your Project") + "</h3>" +
      '<p class="vy-bp__sum">' + esc(bp.summary) + "</p></div>" +
      '<div class="vy-bp__card"><div class="vy-bp__label">System Architecture</div><div class="vy-diagram">' + arch + "</div></div>" +
      '<div class="vy-bp__card"><div class="vy-bp__label">Technology Stack</div><div class="vy-kvg">' +
        '<div class="vy-kv"><b>Frontend</b><span>' + esc(st.frontend) + "</span></div>" +
        '<div class="vy-kv"><b>Backend</b><span>' + esc(st.backend) + "</span></div>" +
        '<div class="vy-kv"><b>Database</b><span>' + esc(st.database) + "</span></div>" +
        '<div class="vy-kv"><b>AI</b><span>' + esc(st.ai) + "</span></div>" +
        '<div class="vy-kv"><b>Infrastructure</b><span>' + esc(st.infrastructure) + "</span></div>" +
      "</div></div>" +
      '<div class="vy-bp__card"><div class="vy-bp__label">Security</div><ul class="vy-list">' + li(bp.security) + "</ul></div>" +
      '<div class="vy-bp__card"><div class="vy-bp__label">Scalability</div><ul class="vy-list">' + li(bp.scalability) + "</ul></div>" +
      '<div class="vy-bp__card"><div class="vy-bp__label">Project Estimation</div>' +
        '<div class="vy-kpis"><div class="vy-kpi"><b>' + esc(e.complexityScore) + "/10</b><span>" + esc(e.complexityLabel) + "</span></div>" +
        '<div class="vy-kpi"><b>' + esc(e.timeline) + "</b><span>Timeline</span></div>" +
        '<div class="vy-kpi"><b>' + esc(e.teamSize) + "</b><span>Team</span></div></div>" +
        '<div class="vy-gauge"><i style="width:' + pct + '%"></i></div>' +
        '<div class="vy-kv" style="margin-bottom:12px"><b>Indicative Budget Range</b><span>' + esc(e.budgetRange) + "</span></div>" +
        '<div class="vy-bp__label">Phases</div>' + phases +
        '<div class="vy-bp__label" style="margin-top:12px">Risk Factors</div><ul class="vy-list">' + li(e.risks) + "</ul></div>" +
      '<div class="vy-bp__card"><div class="vy-bp__label">Proposal</div><p class="vy-bp__sum" style="margin-top:0">' + esc(pr.overview) + "</p>" +
        '<div class="vy-bp__label" style="margin-top:10px">Scope</div><ul class="vy-list">' + li(pr.scope) + "</ul>" +
        '<div class="vy-bp__label" style="margin-top:10px">Deliverables</div><ul class="vy-list">' + li(pr.deliverables) + "</ul>" +
        '<div class="vy-bp__label" style="margin-top:10px">Next Steps</div><ul class="vy-list">' + li(pr.nextSteps) + "</ul></div>" +
      '<div class="vy-bp__act"><button class="vy-bp__btn vy-bp__btn--pdf" type="button">⬇ Download PDF</button>' +
      '<button class="vy-bp__btn vy-bp__btn--copy" type="button">Copy</button>' +
      '<a class="vy-bp__btn vy-bp__btn--ai" href="contact.html">Talk to an expert →</a></div>';
  }

  function renderBlueprint(bp) {
    var card = document.createElement("div");
    card.className = "vy-bp";
    card.innerHTML = buildBlueprintHTML(bp);
    thread.appendChild(card);
    scrollDown();
    card.querySelector(".vy-bp__btn--pdf").addEventListener("click", function () { downloadPdf(bp); });
    var cp = card.querySelector(".vy-bp__btn--copy");
    cp.addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(blueprintToText(bp));
      cp.textContent = "Copied ✓";
    });
    var exp = card.querySelector(".vy-bp__btn--ai");
    if (exp) exp.addEventListener("click", function (e) { e.preventDefault(); openLeadForm(); });
  }

  function blueprintToText(bp) {
    var e = bp.estimation || {}, pr = bp.proposal || {}, st = bp.stack || {};
    var L = function (a) { return (a || []).map(function (x) { return "  - " + x; }).join("\n"); };
    return "PROJECT BLUEPRINT — " + (bp.projectName || "") + "\nby KAIRA · HackTech AI Solutions Architect\n\n" +
      (bp.summary || "") + "\n\n== ARCHITECTURE ==\n" +
      (bp.architecture || []).map(function (n) { return "  - " + n.layer + ": " + n.tech + " — " + n.note; }).join("\n") +
      "\n\n== TECHNOLOGY STACK ==\n  - Frontend: " + st.frontend + "\n  - Backend: " + st.backend +
      "\n  - Database: " + st.database + "\n  - AI: " + st.ai + "\n  - Infrastructure: " + st.infrastructure +
      "\n\n== SECURITY ==\n" + L(bp.security) + "\n\n== SCALABILITY ==\n" + L(bp.scalability) +
      "\n\n== ESTIMATION ==\n  - Complexity: " + e.complexityScore + "/10 (" + e.complexityLabel + ")\n  - Timeline: " +
      e.timeline + "\n  - Team: " + e.teamSize + "\n  - Budget range: " + e.budgetRange + "\n  Phases:\n" +
      (e.phases || []).map(function (p) { return "  - " + p.name + " (" + p.weeks + "): " + p.focus; }).join("\n") +
      "\n  Risks:\n" + L(e.risks) + "\n\n== PROPOSAL ==\n" + (pr.overview || "") + "\n  Scope:\n" + L(pr.scope) +
      "\n  Deliverables:\n" + L(pr.deliverables) + "\n  Next steps:\n" + L(pr.nextSteps) +
      "\n\nPrepared by KAIRA — HackTech. contact.hacktechzone@gmail.com";
  }

  function loadJsPdf(cb) {
    if (window.jspdf && window.jspdf.jsPDF) return cb();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js";
    s.integrity = "sha384-en/ztfPSRkGfME4KIm05joYXynqzUgbsG5nMrj/xEFAHXkeZfO3yMK8QQ+mP7p1/";
    s.crossOrigin = "anonymous";
    s.onload = cb;
    s.onerror = function () { cb(); };
    document.body.appendChild(s);
  }
  function downloadPdf(bp) {
    loadJsPdf(function () {
      var J = window.jspdf && window.jspdf.jsPDF;
      if (!J) { alert("PDF library couldn't load — try Copy instead."); return; }
      var doc = new J({ unit: "pt", format: "a4" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      var margin = 42, y = margin, lines = doc.splitTextToSize(blueprintToText(bp), 515);
      lines.forEach(function (ln) {
        if (y > 790) { doc.addPage(); y = margin; }
        doc.text(ln, margin, y); y += 14;
      });
      doc.save((bp.projectName || "kaira-blueprint").replace(/[^\w]+/g, "-").toLowerCase().slice(0, 40) + "-blueprint.pdf");
    });
  }

  // ---------- Lead capture ----------
  function leadFormHTML() {
    return '<div class="vy-lead__head"><div class="vy-bp__eyebrow">✦ Book a Consultation</div>' +
      '<div class="vy-lead__t">Let&rsquo;s make it real</div>' +
      '<p class="vy-lead__s">Share your details — KAIRA will brief a HackTech specialist on your project.</p></div>' +
      '<form class="vy-lead__form">' +
        '<input name="_hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
        '<div class="vy-lf-row"><input name="name" placeholder="Full name" required><input name="email" type="email" placeholder="Email" required></div>' +
        '<div class="vy-lf-row"><input name="company" placeholder="Company (optional)"><input name="industry" placeholder="Industry (optional)"></div>' +
        '<div class="vy-lf-row">' +
          '<select name="budget"><option value="">Budget range</option><option>Under PKR 100k</option><option>PKR 100k–500k</option><option>PKR 500k–2m</option><option>PKR 2m+ (enterprise)</option></select>' +
          '<select name="timeline"><option value="">Timeline</option><option>ASAP / this month</option><option>1–3 months</option><option>3–6 months</option><option>Just exploring</option></select>' +
        "</div>" +
        '<button class="vy-lf-submit" type="submit">Send to HackTech</button>' +
        '<div class="vy-lf-msg"></div>' +
      "</form>";
  }
  function openLeadForm() {
    if (!started) { started = true; panel.classList.add("is-chatting"); }
    var existing = thread.querySelector(".vy-lead");
    if (existing) { existing.scrollIntoView({ behavior: "smooth", block: "end" }); return; }
    var card = document.createElement("div");
    card.className = "vy-lead";
    card.innerHTML = leadFormHTML();
    thread.appendChild(card);
    scrollDown();
    card.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); submitLead(card); });
  }
  async function submitLead(card) {
    var form = card.querySelector("form");
    var btn = form.querySelector(".vy-lf-submit");
    var msg = form.querySelector(".vy-lf-msg");
    var payload = {};
    new FormData(form).forEach(function (v, k) { payload[k] = v; });
    payload.context = messages.slice(-6).map(function (m) { return (m.role === "user" ? "User: " : "Kaira: ") + m.content; }).join("\n");
    btn.disabled = true; btn.textContent = "Sending…"; msg.textContent = ""; msg.className = "vy-lf-msg";
    try {
      var res = await fetch("/api/kaira-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit.");
      card.innerHTML = '<div class="vy-lead__done"><span class="vy-tier vy-tier--' + esc(data.tier) + '">' + esc(data.tier) + " lead</span>" +
        '<div class="vy-lead__t" style="margin-top:10px">You&rsquo;re in good hands.</div>' +
        '<p class="vy-lead__s">KAIRA has briefed the HackTech team — a specialist will reach out shortly.</p></div>';
      scrollDown();
    } catch (err) {
      msg.textContent = (err && err.message) || "Something went wrong.";
      msg.className = "vy-lf-msg vy-err";
      btn.disabled = false; btn.textContent = "Send to HackTech";
    }
  }

  // ---------- Website Analyzer ----------
  function openAuditForm() {
    if (!started) { started = true; panel.classList.add("is-chatting"); }
    var card = document.createElement("div");
    card.className = "vy-lead";
    card.innerHTML = '<div class="vy-bp__eyebrow">🔍 Website Audit</div>' +
      '<div class="vy-lead__t">Analyze any website</div>' +
      '<p class="vy-lead__s">Enter a URL — KAIRA checks performance, SEO, accessibility &amp; best-practices, then gives professional fixes.</p>' +
      '<form class="vy-lead__form"><div class="vy-af-row"><input name="url" placeholder="example.com" required>' +
      '<button class="vy-lf-submit" type="submit" style="margin:0;white-space:nowrap">Analyze</button></div></form>';
    thread.appendChild(card);
    scrollDown();
    card.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); submitAudit(card); });
  }
  async function submitAudit(card) {
    var form = card.querySelector("form");
    var url = form.querySelector("input[name=url]").value.trim();
    if (!url) return;
    var btn = form.querySelector(".vy-lf-submit");
    btn.disabled = true; btn.textContent = "Analyzing…";
    var loading = bubble("kaira", "");
    loading.innerHTML = "Running a full audit on <b>" + esc(url) + "</b> — performance, SEO, accessibility… this takes ~15s. " +
      '<span class="vy-dots"><i></i><i></i><i></i></span>';
    scrollDown();
    try {
      var res = await fetch("/api/kaira-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url }) });
      var dd = await res.json();
      if (!res.ok) throw new Error(dd.error || "Audit failed.");
      if (loading.parentNode) loading.parentNode.remove();
      renderAudit(dd);
    } catch (err) {
      loading.textContent = (err && err.message) || "Audit failed.";
    } finally {
      btn.disabled = false; btn.textContent = "Analyze";
    }
  }
  function scoreClass(n) { return n >= 90 ? "good" : n >= 50 ? "avg" : "poor"; }
  function renderAudit(d) {
    var sc = d.scores || {};
    function ring(n, label) { return n == null ? "" : '<div class="vy-score vy-score--' + scoreClass(n) + '"><b>' + n + "</b><span>" + label + "</span></div>"; }
    var scores = ring(sc.performance, "Performance") + ring(sc.accessibility, "Accessibility") + ring(sc.seo, "SEO") + ring(sc.bestPractices, "Best Practices");
    var m = d.metrics || {};
    var metrics = "";
    [["LCP", m.lcp], ["FCP", m.fcp], ["Blocking", m.tbt], ["CLS", m.cls], ["Speed Index", m.si]].forEach(function (x) {
      if (x[1]) metrics += '<div class="vy-kv"><b>' + x[0] + "</b><span>" + esc(x[1]) + "</span></div>";
    });
    var recs = (d.recommendations || []).map(function (r) { return '<li><b style="color:var(--vy-cyan)">' + esc(r.area) + ":</b> " + esc(r.text) + "</li>"; }).join("");
    var issues = (d.issues || []).map(function (i) { return "<li>" + esc(i.title) + "</li>"; }).join("");
    var card = document.createElement("div");
    card.className = "vy-bp";
    card.innerHTML = '<div class="vy-bp__head"><div class="vy-bp__eyebrow">🔍 Website Audit</div>' +
      '<h3 class="vy-bp__title" style="font-size:14px;word-break:break-all">' + esc(d.url) + "</h3>" +
      (d.verdict ? '<p class="vy-bp__sum">' + esc(d.verdict) + "</p>" : "") + "</div>" +
      '<div class="vy-scores">' + scores + "</div>" +
      (metrics ? '<div class="vy-bp__card"><div class="vy-bp__label">Core Web Metrics</div><div class="vy-kvg">' + metrics + "</div></div>" : "") +
      (recs ? '<div class="vy-bp__card"><div class="vy-bp__label">KAIRA Recommendations</div><ul class="vy-list">' + recs + "</ul></div>" : "") +
      (issues ? '<div class="vy-bp__card"><div class="vy-bp__label">Flagged Checks</div><ul class="vy-list">' + issues + "</ul></div>" : "") +
      '<div class="vy-bp__act"><button class="vy-bp__btn vy-bp__btn--ai vy-audit-expert" type="button">Talk to an expert →</button></div>';
    thread.appendChild(card);
    scrollDown();
    var exp = card.querySelector(".vy-audit-expert");
    if (exp) exp.addEventListener("click", openLeadForm);
  }

  launch.addEventListener("click", open);
  bpBtn.addEventListener("click", generateBlueprint);
  var expertLink = root.querySelector(".vy-expert");
  if (expertLink) expertLink.addEventListener("click", function (e) { e.preventDefault(); openLeadForm(); });
  closeBtn.addEventListener("click", close);
  if (refreshBtn) refreshBtn.addEventListener("click", resetChat);
  sendBtn.addEventListener("click", function () { send(ta.value); });
  ta.addEventListener("input", autosize);

  // ---- typewriter placeholder: rotates real prompts so visitors instantly
  // see what Kaira can do. Starts only when the panel first OPENS (the
  // placeholder is invisible before that, and a hidden repaint loop
  // tanks Speed Index). Pauses while typing/focused; reduced-motion static.
  var twStarted = false;
  function startTypewriter() {
    if (twStarted) return;
    twStarted = true;
    var PROMPTS = [
      "Quote for a fleet-tracking system…",
      "I need a website for my business…",
      "Audit my website's performance…",
      "Build me an AI chatbot…",
      "Estimate a mobile app…"
    ];
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      ta.placeholder = PROMPTS[0];
      return;
    }
    var pi = 0, ci = 0, del = false;
    (function type() {
      var active = document.activeElement === ta || ta.value;
      if (!active) {
        var w = PROMPTS[pi];
        ci += del ? -1 : 1;
        ta.placeholder = w.slice(0, ci);
        if (!del && ci === w.length) { del = true; return setTimeout(type, 1800); }
        if (del && ci === 0) { del = false; pi = (pi + 1) % PROMPTS.length; }
      }
      setTimeout(type, del ? 28 : 55);
    })();
  }
  ta.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(ta.value); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("is-open")) close();
  });

  // mount the 3D mascot launcher — Three.js (UMD, classic) + GLTFLoader
  // from jsdelivr (CSP-allowed), then the mascot (gltf model → procedural
  // fallback). Perf: the whole 3D stack (~3.4MB) is DEFERRED until first
  // interaction — or an 8s idle fallback — so it never competes with
  // first paint. The CSS orb covers the launcher until then.
  (function () {
    var armed = false;
    function mount3d() {
      if (armed || document.getElementById("kaira-three")) return;
      armed = true;
      var V = "https://cdn.jsdelivr.net/npm/three@0.128.0";
      function load(src, id, integrity) {
        var s = document.createElement("script");
        if (id) s.id = id;
        s.src = src;
        if (integrity) { s.integrity = integrity; s.crossOrigin = "anonymous"; }
        s.async = false;
        document.body.appendChild(s);
      }
      load(V + "/build/three.min.js", "kaira-three", "sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu");
      load(V + "/examples/js/loaders/GLTFLoader.js", "kaira-gltf", "sha384-fljlqkjWlmSFjkESkQvm77heIZpoWmXEOzlCA7kOpGUH+95Zk0yGfQieWM2q136E");
      load("kaira-robot.js", "kaira-robot");
    }
    ["pointermove", "pointerdown", "scroll", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, mount3d, { once: true, passive: true });
    });
    setTimeout(mount3d, 8000);
  })();
})();

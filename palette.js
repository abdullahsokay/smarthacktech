/* ============================================================
   HackTech — ⌘K / Ctrl+K command palette
   Zero-dependency. Fuzzy-ish scoring, arrow-key nav, focus trap,
   Esc to close. Actions reuse existing site hooks (KairaChat,
   themeToggle). Styled in enhance.css (.cp-*).
   ============================================================ */
(function () {
  "use strict";
  if (window.__htPalette) return;
  window.__htPalette = true;

  var ITEMS = [
    // pages
    { t: "Home", s: "Pakistan's complete technology ecosystem", href: "index.html", k: "🏠" },
    { t: "Services", s: "All seven service lines", href: "solutions.html", k: "🧭" },
    { t: "Portfolio", s: "The team & the work we've shipped", href: "portfolio.html", k: "🗂" },
    { t: "Live Demo", s: "SOTMS fleet dashboard, live", href: "demo.html", k: "📡" },
    { t: "About", s: "Our story, team & values", href: "about.html", k: "👋" },
    { t: "Contact", s: "Get a quote — we reply fast", href: "contact.html", k: "✉️" },
    // services
    { t: "Software Development", s: "Web, mobile, SaaS, enterprise", href: "service.html?s=software", k: "💻" },
    { t: "AI & Automation", s: "Chatbots, agents, computer vision", href: "service.html?s=ai", k: "🤖" },
    { t: "IoT Solutions", s: "Devices & live dashboards", href: "service.html?s=iot", k: "📶" },
    { t: "Security & Surveillance", s: "CCTV, access control, biometrics", href: "service.html?s=security", k: "🛡" },
    { t: "Smart Home & Automation", s: "One app, one voice", href: "service.html?s=smarthome", k: "🏡" },
    { t: "Graphic Design", s: "Figma & Canva — brand that ships", href: "service.html?s=design", k: "🎨" },
    { t: "Training & Education", s: "Hands-on cohorts & workshops", href: "service.html?s=training", k: "🎓" },
    // actions
    { t: "Chat with Kaira", s: "Our AI Solutions Architect", k: "✦", act: function () { if (window.KairaChat) window.KairaChat.open(); } },
    { t: "WhatsApp us", s: "0327 5516703 — quick reply", k: "💬", act: function () { window.open("https://wa.me/923275516703", "_blank", "noopener"); } },
    { t: "Toggle theme", s: "Dark ↔ light", k: "🌗", act: function () { var b = document.getElementById("themeToggle"); if (b) b.click(); } },
    { t: "Email us", s: "contact.hacktechzone@gmail.com", k: "✉️", act: function () { location.href = "mailto:contact.hacktechzone@gmail.com"; } }
  ];

  var root, input, list, open = false, sel = 0, results = ITEMS;

  function esc(s) {
    return String(s).replace(/[<>&]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]; });
  }

  function build() {
    if (root) return;
    root = document.createElement("div");
    root.className = "cp";
    root.innerHTML =
      '<div class="cp__scrim"></div>' +
      '<div class="cp__panel" role="dialog" aria-modal="true" aria-label="Command palette">' +
        '<div class="cp__head"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>' +
        '<input class="cp__input" type="text" placeholder="Search pages, services, actions…" aria-label="Search commands">' +
        '<kbd class="cp__esc">esc</kbd></div>' +
        '<ul class="cp__list" role="listbox"></ul>' +
        '<div class="cp__foot"><span>↑↓ navigate</span><span>↵ open</span><span class="cp__brand">HackTech</span></div>' +
      "</div>";
    document.body.appendChild(root);
    input = root.querySelector(".cp__input");
    list = root.querySelector(".cp__list");
    root.querySelector(".cp__scrim").addEventListener("click", close);
    input.addEventListener("input", function () { filter(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); go(sel); }
      else if (e.key === "Escape") { close(); }
    });
    list.addEventListener("click", function (e) {
      var li = e.target.closest("[data-i]");
      if (li) go(+li.getAttribute("data-i"));
    });
    list.addEventListener("pointermove", function (e) {
      var li = e.target.closest("[data-i]");
      if (li && +li.getAttribute("data-i") !== sel) { sel = +li.getAttribute("data-i"); paint(); }
    });
  }

  function score(item, q) {
    var t = item.t.toLowerCase(), s = item.s.toLowerCase();
    if (t.indexOf(q) === 0) return 3;
    if (t.indexOf(q) > -1) return 2;
    if (s.indexOf(q) > -1) return 1;
    return 0;
  }

  function filter(q) {
    q = q.trim().toLowerCase();
    results = !q ? ITEMS : ITEMS
      .map(function (it) { return { it: it, sc: score(it, q) }; })
      .filter(function (r) { return r.sc > 0; })
      .sort(function (a, b) { return b.sc - a.sc; })
      .map(function (r) { return r.it; });
    sel = 0;
    paint();
  }

  function paint() {
    list.innerHTML = results.length ? results.map(function (it, i) {
      return '<li class="cp__item' + (i === sel ? " is-sel" : "") + '" data-i="' + i + '" role="option" aria-selected="' + (i === sel) + '" style="--d:' + Math.min(i, 8) + '">' +
        '<span class="cp__ico">' + it.k + "</span><span><b>" + esc(it.t) + "</b><small>" + esc(it.s) + "</small></span>" +
        (it.href ? '<span class="cp__go">↵</span>' : '<span class="cp__go cp__go--act">run</span>') +
      "</li>";
    }).join("") : '<li class="cp__empty">No matches — try "AI", "quote", "demo"…</li>';
    var el = list.querySelector(".is-sel");
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  function move(d) {
    if (!results.length) return;
    sel = (sel + d + results.length) % results.length;
    paint();
  }

  function go(i) {
    var it = results[i];
    if (!it) return;
    close();
    if (it.act) it.act();
    else location.href = it.href;
  }

  function openPal() {
    build();
    open = true;
    root.classList.add("is-open");
    input.value = "";
    filter("");
    setTimeout(function () { input.focus(); }, 30);
    document.documentElement.style.overflow = "hidden";
  }
  function close() {
    if (!open) return;
    open = false;
    root.classList.remove("is-open");
    document.documentElement.style.overflow = "";
  }

  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      open ? close() : openPal();
    } else if (e.key === "Escape" && open) close();
  });

  // desktop hint chip in the nav tools (fine pointers only)
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var tools = document.querySelector(".nav-tools");
    if (tools) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cp-hint";
      b.setAttribute("aria-label", "Open command palette");
      b.innerHTML = "<kbd>Ctrl</kbd><kbd>K</kbd>";
      b.addEventListener("click", openPal);
      tools.appendChild(b);
    }
  }
})();

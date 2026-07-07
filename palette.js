/* ============================================================
   HackTech, ⌘K / Ctrl+K command palette
   Zero-dependency. Fuzzy-ish scoring, arrow-key nav, focus trap,
   Esc to close. Actions reuse existing site hooks (KairaChat,
   themeToggle). Styled in enhance.css (.cp-*).
   ============================================================ */
(function () {
  "use strict";
  if (window.__htPalette) return;
  window.__htPalette = true;

  // inline SVG glyphs (site icon language: 1.8-stroke, currentColor) — no
  // emoji: they render differently per OS and can't follow theme tokens.
  function ic(p) {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }
  var I = {
    home: ic('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
    grid: ic('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    folder: ic('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    signal: ic('<path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0"/>'),
    users: ic('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><path d="M16 8.5a2.8 2.8 0 1 1 2 4.8c2 .6 3.3 2 3.8 4.2"/>'),
    mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    code: ic('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    spark: ic('<path d="M12 3v5M12 16v5M3 12h5M16 12h5"/><path d="M12 8l1.4 2.6L16 12l-2.6 1.4L12 16l-1.4-2.6L8 12l2.6-1.4z"/>'),
    chip: ic('<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
    shield: ic('<path d="M12 3l8 3.5v5c0 4.6-3.4 7.8-8 9-4.6-1.2-8-4.4-8-9v-5z"/><path d="M9.5 12l1.8 1.8 3.4-3.6"/>'),
    palette: ic('<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h6a3 3 0 0 0 3-3c0-4-4.5-7-9-7z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10" r="1"/>'),
    grad: ic('<path d="M12 4 2 9l10 5 10-5-10-5z"/><path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/>'),
    chat: ic('<path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"/>'),
    moon: ic('<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>'),
    phone: ic('<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>')
  };

  var ITEMS = [
    // pages
    { t: "Home", s: "Pakistan's complete technology ecosystem", href: "index.html", k: I.home },
    { t: "Services", s: "All seven service lines", href: "solutions.html", k: I.grid },
    { t: "Portfolio", s: "The team & the work we've shipped", href: "portfolio.html", k: I.folder },
    { t: "Live Demo", s: "SOTMS fleet dashboard, live", href: "demo.html", k: I.signal },
    { t: "About", s: "Our story, team & values", href: "about.html", k: I.users },
    { t: "Contact", s: "Get a quote, we reply fast", href: "contact.html", k: I.mail },
    // services
    { t: "Software Development", s: "Web, mobile, SaaS, enterprise", href: "service.html?s=software", k: I.code },
    { t: "AI & Automation", s: "Chatbots, agents, computer vision", href: "service.html?s=ai", k: I.spark },
    { t: "IoT Solutions", s: "Devices & live dashboards", href: "service.html?s=iot", k: I.chip },
    { t: "Security & Surveillance", s: "CCTV, access control, biometrics", href: "service.html?s=security", k: I.shield },
    { t: "Smart Home & Automation", s: "One app, one voice", href: "service.html?s=smarthome", k: I.home },
    { t: "Graphic Design", s: "Figma & Canva, brand that ships", href: "service.html?s=design", k: I.palette },
    { t: "Training & Education", s: "Hands-on cohorts & workshops", href: "service.html?s=training", k: I.grad },
    // actions
    { t: "Chat with Kaira", s: "Our AI Solutions Architect", k: I.spark, act: function () { if (window.KairaChat) window.KairaChat.open(); } },
    { t: "WhatsApp us", s: "0327 5516703, quick reply", k: I.chat, act: function () { window.open("https://wa.me/923275516703", "_blank", "noopener"); } },
    { t: "Toggle theme", s: "Dark ↔ light", k: I.moon, act: function () { var b = document.getElementById("themeToggle"); if (b) b.click(); } },
    { t: "Email us", s: "contact.hacktechzone@gmail.com", k: I.mail, act: function () { location.href = "mailto:contact.hacktechzone@gmail.com"; } }
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
    }).join("") : '<li class="cp__empty">No matches, try "AI", "quote", "demo"…</li>';
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

  var lastFocus = null;   // restore focus here on close (dialog pattern)

  function openPal() {
    build();
    open = true;
    lastFocus = document.activeElement;
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
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      open ? close() : openPal();
    } else if (e.key === "Escape" && open) close();
    // focus trap: the search input is the dialog's only tabbable control,
    // so Tab must not escape into the inert page behind the scrim.
    else if (e.key === "Tab" && open) { e.preventDefault(); input.focus(); }
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

/* ============================================================
   HackTech, shared header & footer
   Single source of truth, injected into every page.
   ============================================================ */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";

  var LINKS = [
    ["home", "index.html", "Home"],
    ["solutions", "solutions.html", "Services"],
    ["portfolio", "portfolio.html", "Portfolio"],
    ["about", "about.html", "About"],
    ["tech", "tech.html", "Experience"]
  ];

  function activeAttr(key) {
    return key === page ? ' class="active" aria-current="page"' : "";
  }

  // Services dropdown, the service lines (mirrors service.js keys)
  var SERVICE_MENU = [
    ["software", "Software Development"],
    ["ai", "AI &amp; Automation"],
    ["iot", "IoT Solutions"],
    ["security", "Security &amp; Surveillance"],
    ["smarthome", "Smart Home &amp; Automation"],
    ["design", "Graphic Design"],
    ["training", "Training &amp; Education"]
  ];
  // About dropdown, quick links into the About page sections (title + subtitle)
  var ABOUT_MENU = [
    ["about.html#deliver", "What We Deliver", "Our services at a glance"],
    ["about.html#story", "Our Story", "How HackTech started"],
    ["about.html#team", "Meet the Team", "The people behind the build"],
    ["about.html#values", "What We Stand For", "Our values &amp; principles"],
    ["about.html#journey", "Our Journey", "From the bench to an ecosystem"],
    ["contact.html", "Work With Us", "Get in touch"]
  ];
  var caret = '<svg class="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  var navItems = LINKS.map(function (l) {
    var key = l[0], href = l[1], label = l[2];
    if (key === "solutions") {
      var menu = SERVICE_MENU.map(function (s) {
        return '<li><a href="service.html?s=' + s[0] + '">' + s[1] + "</a></li>";
      }).join("");
      return '<li class="nav-item nav-item--has-menu">' +
        '<a href="' + href + '" data-nav="' + key + '"' + activeAttr(key) + ">" + label + caret + "</a>" +
        '<ul class="nav-menu" aria-label="Services">' + menu + "</ul>" +
      "</li>";
    }
    if (key === "about") {
      var amenu = ABOUT_MENU.map(function (a) {
        return '<li><a href="' + a[0] + '"><span class="nm__t">' + a[1] + '</span><span class="nm__s">' + a[2] + "</span></a></li>";
      }).join("");
      return '<li class="nav-item nav-item--has-menu">' +
        '<a href="' + href + '" data-nav="' + key + '"' + activeAttr(key) + ">" + label + caret + "</a>" +
        '<ul class="nav-menu nav-menu--rich" aria-label="About">' + amenu + "</ul>" +
      "</li>";
    }
    return '<li><a href="' + href + '" data-nav="' + key + '"' + activeAttr(key) + ">" + label + "</a></li>";
  }).join("");

  var headerHTML =
    '<a class="skip-link" href="#main">Skip to main content</a>' +
    '<nav class="nav" id="nav" aria-label="Primary">' +
      '<a class="logo" href="index.html"><span class="logo__mark" aria-hidden="true"><svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true"><path class="logo__hex" d="M16 4.5l10 5.75v11.5L16 27.5 6 21.75V10.25z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg></span> Hack<span>Tech</span></a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navLinks">' +
        "<span></span><span></span><span></span>" +
      "</button>" +
      '<ul class="nav-links" id="navLinks">' +
        navItems +
        '<li class="nav-tools"><button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch theme" aria-pressed="false">' +
          '<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
          '<svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>' +
        "</button></li>" +
        '<li><a class="btn btn--primary btn--sm" href="contact.html" data-nav="contact"' +
          (page === "contact" ? ' aria-current="page"' : "") + ">Get a Quote</a></li>" +
      "</ul>" +
    "</nav>";

  var footerHTML =
    '<footer class="footer">' +
      '<div class="container">' +
        '<div class="footer__top">' +
          '<div class="footer__brand">' +
            '<a class="logo" href="index.html"><span class="logo__mark" aria-hidden="true"><svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true"><path class="logo__hex" d="M16 4.5l10 5.75v11.5L16 27.5 6 21.75V10.25z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg></span> Hack<span>Tech</span></a>' +
            "<p>Pakistan's complete technology ecosystem, software, AI, IoT, security, automation and training. Made in Pakistan.</p>" +
          "</div>" +
          '<div class="footer__col"><h3>What we do</h3>' +
            '<a href="solutions.html">Services</a><a href="about.html">About</a><a href="contact.html">Get a Quote</a></div>' +
          '<div class="footer__col"><h3>Company</h3>' +
            '<a href="about.html">About</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div>' +
          '<div class="footer__col"><h3>Get in touch</h3>' +
            '<a href="mailto:contact.hacktechzone@gmail.com">contact.hacktechzone@gmail.com</a><a href="tel:+923275516703">0327 5516703</a><a href="https://www.tiktok.com/@hacktech.zone" target="_blank" rel="noopener">TikTok · hacktech zone</a></div>' +
        "</div>" +
        '<div class="footer__bottom">' +
          "<span>© 2026 HackTech Technologies (Pvt) Ltd. All rights reserved.</span>" +
          '<span class="open-chip" id="openChip"></span>' +
          "<span>Engineered in Pakistan 🇵🇰</span>" +
        "</div>" +
      "</div>" +
    "</footer>";

  var h = document.querySelector('[data-include="header"]');
  if (h) h.outerHTML = headerHTML;
  var f = document.querySelector('[data-include="footer"]');
  if (f) f.outerHTML = footerHTML;

  // ---- theme toggle (dark by default; choice saved; applied pre-paint by the inline <head> script) ----
  (function () {
    var root = document.documentElement;
    var btn = document.getElementById("themeToggle");
    var meta = document.querySelector('meta[name="theme-color"]');
    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (meta) meta.setAttribute("content", theme === "light" ? "#f4f2ec" : "#0A0A0A");
      if (btn) {
        btn.setAttribute("aria-pressed", String(theme === "light"));
        btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
      }
    }
    apply(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    if (btn) btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      try { localStorage.setItem("ht-theme", next); } catch (e) {}
      apply(next);
    });
  })();

  // ---- WhatsApp floating button (bottom-left; Kaira owns bottom-right) ----
  (function () {
    var a = document.createElement("a");
    a.className = "wa-fab";
    a.href = "https://wa.me/923275516703?text=" + encodeURIComponent("Hi HackTech! I'd like to discuss a project.");
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "Chat with HackTech on WhatsApp");
    a.innerHTML =
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.6.1-.8l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.2z"/></svg>';
    document.body.appendChild(a);
  })();

  // ---- "Open now" chip, live Karachi time + Mon–Sat 9:00–18:00 status ----
  (function () {
    var chip = document.getElementById("openChip");
    if (!chip) return;
    function tick() {
      try {
        var parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit",
          hour12: false, weekday: "short"
        }).formatToParts(new Date());
        var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
        var day = get("weekday"), hh = parseInt(get("hour"), 10);
        var open = day !== "Sun" && hh >= 9 && hh < 18;
        chip.innerHTML = open
          ? '<i class="dot-live"></i> Open now · ' + get("hour") + ":" + get("minute") + " PKT"
          : "Closed · opens " + (day === "Sat" ? "Mon" : "") + " 9:00 PKT";
        chip.classList.toggle("is-open", open);
      } catch (e) { /* Intl unsupported → chip stays empty */ }
    }
    tick();
    setInterval(tick, 60000);
  })();

  // ---- VEYRA on-site chat widget (loaded site-wide) ----
  (function () {
    if (document.getElementById("vy-css")) return;
    function mount() {
      if (document.getElementById("vy-css")) return;
      var css = document.createElement("link");
      css.id = "vy-css";
      css.rel = "stylesheet";
      css.href = "veyra.css";
      document.head.appendChild(css);
      var js = document.createElement("script");
      js.src = "veyra.js";
      js.defer = true;
      document.body.appendChild(js);
    }
    // Phones: keep the main thread clear during first paint, mount the
    // widget when the CPU idles (or after 4s, whichever comes first).
    if (window.matchMedia("(hover:none),(pointer:coarse),(max-width:760px)").matches && "requestIdleCallback" in window) {
      requestIdleCallback(mount, { timeout: 4000 });
    } else {
      mount();
    }
  })();
})();

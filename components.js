/* ============================================================
   HackTech — shared header & footer
   Single source of truth, injected into every page.
   ============================================================ */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";

  var LINKS = [
    ["home", "index.html", "Home"],
    ["solutions", "solutions.html", "Services"],
    ["work", "index.html#work", "Work"],
    ["demo", "demo.html", "Live Demo"],
    ["about", "about.html", "About"],
    ["tech", "tech.html", "Experience"]
  ];

  function activeAttr(key) {
    return key === page ? ' class="active" aria-current="page"' : "";
  }

  // Services dropdown — the six service lines (mirrors service.js keys)
  var SERVICE_MENU = [
    ["software", "Software Development"],
    ["ai", "AI &amp; Automation"],
    ["iot", "IoT Solutions"],
    ["security", "Security &amp; Surveillance"],
    ["smarthome", "Smart Home &amp; Automation"],
    ["training", "Training &amp; Education"]
  ];
  // About dropdown — quick links into the About page sections (title + subtitle)
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
    var badge = key === "demo" ? ' <span class="nav-badge">NEW</span>' : "";
    return '<li><a href="' + href + '" data-nav="' + key + '"' + activeAttr(key) + ">" + label + badge + "</a></li>";
  }).join("");

  var headerHTML =
    '<a class="skip-link" href="#main">Skip to main content</a>' +
    '<nav class="nav" id="nav" aria-label="Primary">' +
      '<a class="logo" href="index.html"><span class="logo__mark" aria-hidden="true">⬡</span> Hack<span>Tech</span></a>' +
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
            '<a class="logo" href="index.html"><span class="logo__mark" aria-hidden="true">⬡</span> Hack<span>Tech</span></a>' +
            "<p>Pakistan's complete technology ecosystem — software, AI, IoT, security, automation and training. Made in Pakistan.</p>" +
          "</div>" +
          '<div class="footer__col"><h4>What we do</h4>' +
            '<a href="solutions.html">Services</a><a href="demo.html">Live Demo</a><a href="about.html">About</a><a href="contact.html">Get a Quote</a></div>' +
          '<div class="footer__col"><h4>Company</h4>' +
            '<a href="about.html">About</a><a href="contact.html">Contact</a><a href="#">Careers</a></div>' +
          '<div class="footer__col"><h4>Connect</h4>' +
            '<a href="#">LinkedIn</a><a href="#">Instagram</a><a href="#">YouTube</a></div>' +
        "</div>" +
        '<div class="footer__bottom">' +
          "<span>© 2026 HackTech Technologies (Pvt) Ltd. All rights reserved.</span>" +
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

  // ---- VEYRA on-site chat widget (loaded site-wide) ----
  (function () {
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
  })();
})();

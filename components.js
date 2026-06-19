/* ============================================================
   HackTech — shared header, footer & robot mascot
   Single source of truth, injected into every page.
   ============================================================ */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";

  var LINKS = [
    ["home", "index.html", "Home"],
    ["solutions", "solutions.html", "Services"],
    ["demo", "demo.html", "Live Demo"],
    ["about", "about.html", "About"],
    ["tech", "tech.html", "Experience"]
  ];

  function activeAttr(key) {
    return key === page ? ' class="active" aria-current="page"' : "";
  }

  var navItems = LINKS.map(function (l) {
    return '<li><a href="' + l[1] + '" data-nav="' + l[0] + '"' + activeAttr(l[0]) + ">" + l[2] + "</a></li>";
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
            "<p>Pakistan's complete technology ecosystem — software, AI, IoT, security, automation, training &amp; hardware supply. Made in Pakistan.</p>" +
          "</div>" +
          '<div class="footer__col"><h4>What we do</h4>' +
            '<a href="solutions.html">Services</a><a href="solutions.html#store">IoT Store</a><a href="demo.html">Live Demo</a><a href="contact.html">Get a Quote</a></div>' +
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

  // ---- floating robot mascot (site-wide; skips the full-screen experience page) ----
  if (page !== "tech" && page !== "home") {
    var robotSVG = '<svg class="mascot__svg" viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<defs>'
      + '<linearGradient id="mWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef3f5"/><stop offset="1" stop-color="#c3ccd1"/></linearGradient>'
      + '<radialGradient id="mDome" cx=".38" cy=".30" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e9eef1"/><stop offset="1" stop-color="#b9c3c8"/></radialGradient>'
      + '<linearGradient id="mDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a424a"/><stop offset="1" stop-color="#0c1116"/></linearGradient>'
      + '<radialGradient id="mScreen" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#15202a"/><stop offset="1" stop-color="#070b0f"/></radialGradient>'
      + '<radialGradient id="mEye" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#eaffff"/><stop offset=".35" stop-color="#5fe0ff"/><stop offset="1" stop-color="#13a7e6" stop-opacity="0"/></radialGradient>'
      + '</defs>'
      // antennae
      + '<g class="mascot__ant">'
      + '<g class="mascot__antL"><line x1="98" y1="50" x2="84" y2="18" stroke="#aab6bc" stroke-width="3.5" stroke-linecap="round"/><circle class="mascot__ledtip" cx="82" cy="15" r="6" fill="#5fe0ff"/></g>'
      + '<g class="mascot__antR"><line x1="142" y1="50" x2="156" y2="18" stroke="#aab6bc" stroke-width="3.5" stroke-linecap="round"/><circle class="mascot__ledtip" cx="158" cy="15" r="6" fill="#5fe0ff"/></g>'
      + '</g>'
      // ears
      + '<rect x="46" y="92" width="16" height="46" rx="8" fill="url(#mDark)"/><rect class="mascot__ear" x="50" y="100" width="4" height="30" rx="2" fill="#5fe0ff"/>'
      + '<rect x="178" y="92" width="16" height="46" rx="8" fill="url(#mDark)"/><rect class="mascot__ear" x="186" y="100" width="4" height="30" rx="2" fill="#5fe0ff"/>'
      // head + gloss
      + '<rect x="52" y="44" width="136" height="118" rx="56" fill="url(#mDome)" stroke="#c4ced3" stroke-width="1.5"/>'
      + '<ellipse cx="92" cy="76" rx="34" ry="18" fill="#ffffff" opacity=".55"/>'
      // screen
      + '<rect x="64" y="72" width="112" height="78" rx="32" fill="url(#mScreen)"/><ellipse cx="110" cy="92" rx="48" ry="14" fill="#9fd8ff" opacity=".08"/>'
      // eyes (glowing rings)
      + '<g class="mascot__eyes">'
      + '<g class="mascot__eye"><circle cx="96" cy="112" r="16" fill="url(#mEye)"/><circle cx="96" cy="112" r="10" fill="none" stroke="#dffaff" stroke-width="4"/><circle cx="96" cy="112" r="3.2" fill="#ffffff"/></g>'
      + '<g class="mascot__eye"><circle cx="144" cy="112" r="16" fill="url(#mEye)"/><circle cx="144" cy="112" r="10" fill="none" stroke="#dffaff" stroke-width="4"/><circle cx="144" cy="112" r="3.2" fill="#ffffff"/></g>'
      + '</g>'
      // blush + mouth (appear when happy)
      + '<ellipse class="mascot__blush" cx="80" cy="132" rx="9" ry="4.5" fill="#ff8db0"/><ellipse class="mascot__blush" cx="160" cy="132" rx="9" ry="4.5" fill="#ff8db0"/>'
      + '<path class="mascot__mouth" d="M108 134 Q120 143 132 134" fill="none" stroke="#dffaff" stroke-width="3" stroke-linecap="round"/>'
      // neck
      + '<rect x="108" y="160" width="24" height="12" rx="4" fill="#c3ccd1"/>'
      // body
      + '<rect x="74" y="168" width="92" height="74" rx="32" fill="url(#mWhite)" stroke="#c4ced3" stroke-width="1.5"/>'
      + '<ellipse cx="100" cy="186" rx="20" ry="9" fill="#ffffff" opacity=".5"/>'
      + '<rect class="mascot__chestbar" x="104" y="180" width="32" height="8" rx="4" fill="#34b3a9"/>'
      + '<path d="M96 214 Q120 226 144 214" fill="none" stroke="#c4ced3" stroke-width="2"/>'
      // shoulders
      + '<circle cx="76" cy="182" r="11" fill="url(#mDark)"/><circle cx="164" cy="182" r="11" fill="url(#mDark)"/>'
      // right arm (relaxed)
      + '<g class="mascot__armR"><rect x="158" y="184" width="15" height="40" rx="7.5" fill="url(#mWhite)" stroke="#c4ced3" stroke-width="1.2"/><circle cx="165" cy="228" r="8" fill="url(#mDark)"/></g>'
      // left arm (waves)
      + '<g class="mascot__armL"><rect x="67" y="184" width="15" height="38" rx="7.5" fill="url(#mWhite)" stroke="#c4ced3" stroke-width="1.2"/><circle cx="74" cy="226" r="9" fill="url(#mDark)"/><rect x="70" y="214" width="8" height="14" rx="4" fill="url(#mDark)"/></g>'
      // legs / feet
      + '<rect x="92" y="240" width="16" height="20" rx="6" fill="url(#mDark)"/><rect x="132" y="240" width="16" height="20" rx="6" fill="url(#mDark)"/>'
      + '<ellipse cx="98" cy="264" rx="18" ry="9" fill="url(#mWhite)" stroke="#c4ced3" stroke-width="1.5"/><ellipse cx="142" cy="264" rx="18" ry="9" fill="url(#mWhite)" stroke="#c4ced3" stroke-width="1.5"/>'
      + '</svg>';

    var mascot = document.createElement("button");
    mascot.className = "mascot";
    mascot.id = "mascot";
    mascot.type = "button";
    mascot.setAttribute("aria-label", "Talk to HackTech — get a quote");
    mascot.innerHTML =
      '<span class="mascot__bubble" id="mascotBubble" aria-hidden="true">Hi! 👋</span>' +
      '<span class="mascot__inner">' + robotSVG + "</span>" +
      '<span class="mascot__halo" aria-hidden="true"></span>' +
      '<span class="mascot__shadow" aria-hidden="true"></span>';
    document.body.appendChild(mascot);
  }

  // ---- home only: scroll-reactive 3D robot scene (flyer + page-lifter) ----
  if (page === "home") {
    var flyerSVG = '<svg viewBox="0 0 130 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<defs>'
      + '<radialGradient id="fD" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#e9eef1"/><stop offset="1" stop-color="#b9c3c8"/></radialGradient>'
      + '<linearGradient id="fW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#c6cfd4"/></linearGradient>'
      + '<radialGradient id="fE" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#eaffff"/><stop offset=".4" stop-color="#5fe0ff"/><stop offset="1" stop-color="#13a7e6" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="fF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff7ff"/><stop offset="1" stop-color="#34b3a9" stop-opacity="0"/></linearGradient>'
      + '</defs>'
      + '<line x1="52" y1="34" x2="44" y2="14" stroke="#aab6bc" stroke-width="2.5" stroke-linecap="round"/><circle class="bot__glow" cx="43" cy="11" r="4" fill="#5fe0ff"/>'
      + '<line x1="78" y1="34" x2="86" y2="14" stroke="#aab6bc" stroke-width="2.5" stroke-linecap="round"/><circle class="bot__glow" cx="87" cy="11" r="4" fill="#5fe0ff"/>'
      + '<rect x="28" y="30" width="74" height="62" rx="30" fill="url(#fD)" stroke="#c4ced3" stroke-width="1.3"/>'
      + '<ellipse cx="48" cy="46" rx="17" ry="8" fill="#fff" opacity=".5"/>'
      + '<rect x="38" y="44" width="54" height="36" rx="16" fill="#0b1116"/>'
      + '<circle cx="54" cy="62" r="9" fill="url(#fE)"/><circle cx="54" cy="62" r="5.5" fill="none" stroke="#dffaff" stroke-width="2.6"/>'
      + '<circle cx="76" cy="62" r="9" fill="url(#fE)"/><circle cx="76" cy="62" r="5.5" fill="none" stroke="#dffaff" stroke-width="2.6"/>'
      + '<rect x="46" y="92" width="38" height="30" rx="14" fill="url(#fW)" stroke="#c4ced3" stroke-width="1.3"/>'
      + '<circle class="bot__glow" cx="65" cy="106" r="4" fill="#34b3a9"/>'
      + '<path class="robo-thrust" d="M54 122 L76 122 L65 150 Z" fill="url(#fF)"/>'
      + '</svg>';

    var lifterSVG = '<svg viewBox="0 0 160 188" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<defs>'
      + '<radialGradient id="lD" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#e9eef1"/><stop offset="1" stop-color="#b9c3c8"/></radialGradient>'
      + '<linearGradient id="lW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#c6cfd4"/></linearGradient>'
      + '<radialGradient id="lE" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#eaffff"/><stop offset=".4" stop-color="#5fe0ff"/><stop offset="1" stop-color="#13a7e6" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="lDk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a424a"/><stop offset="1" stop-color="#0c1116"/></linearGradient>'
      + '</defs>'
      + '<line x1="64" y1="28" x2="58" y2="10" stroke="#aab6bc" stroke-width="2.5" stroke-linecap="round"/><circle class="bot__glow" cx="57" cy="8" r="4" fill="#5fe0ff"/>'
      + '<line x1="96" y1="28" x2="102" y2="10" stroke="#aab6bc" stroke-width="2.5" stroke-linecap="round"/><circle class="bot__glow" cx="103" cy="8" r="4" fill="#5fe0ff"/>'
      + '<rect x="30" y="22" width="100" height="82" rx="40" fill="url(#lD)" stroke="#c4ced3" stroke-width="1.4"/>'
      + '<ellipse cx="56" cy="42" rx="20" ry="10" fill="#fff" opacity=".5"/>'
      + '<rect x="42" y="40" width="76" height="50" rx="20" fill="#0b1116"/>'
      + '<circle cx="62" cy="64" r="11" fill="url(#lE)"/><circle cx="62" cy="64" r="7" fill="none" stroke="#dffaff" stroke-width="3"/>'
      + '<circle cx="98" cy="64" r="11" fill="url(#lE)"/><circle cx="98" cy="64" r="7" fill="none" stroke="#dffaff" stroke-width="3"/>'
      + '<rect x="50" y="108" width="60" height="50" rx="22" fill="url(#lW)" stroke="#c4ced3" stroke-width="1.4"/>'
      + '<rect class="bot__glow" x="70" y="118" width="20" height="6" rx="3" fill="#34b3a9"/>'
      + '<circle cx="50" cy="118" r="9" fill="url(#lDk)"/><circle cx="110" cy="118" r="9" fill="url(#lDk)"/>'
      + '<g class="lift-armL"><rect x="40" y="118" width="13" height="36" rx="6.5" fill="url(#lW)" stroke="#c4ced3" stroke-width="1.2"/><circle cx="46" cy="156" r="8" fill="url(#lDk)"/></g>'
      + '<g class="lift-armR"><rect x="107" y="118" width="13" height="36" rx="6.5" fill="url(#lW)" stroke="#c4ced3" stroke-width="1.2"/><circle cx="113" cy="156" r="8" fill="url(#lDk)"/></g>'
      + '<rect x="64" y="156" width="13" height="16" rx="5" fill="url(#lDk)"/><rect x="83" y="156" width="13" height="16" rx="5" fill="url(#lDk)"/>'
      + '<ellipse cx="68" cy="176" rx="15" ry="7" fill="url(#lW)" stroke="#c4ced3" stroke-width="1.3"/><ellipse cx="92" cy="176" rx="15" ry="7" fill="url(#lW)" stroke="#c4ced3" stroke-width="1.3"/>'
      + '</svg>';

    var scene = document.createElement("div");
    scene.className = "robo-scene";
    scene.setAttribute("aria-hidden", "true");
    scene.innerHTML =
      '<div class="robo-fly"><span class="robo-fly__in">' + flyerSVG + "</span></div>" +
      '<div class="robo-lift">' + lifterSVG + "</div>";
    document.body.appendChild(scene);
  }
})();

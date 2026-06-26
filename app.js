/* ============================================================
   HACKTECH — shared interactions & "wow" features
   Every feature is guarded so it only runs if its markup exists.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var finePointer = window.matchMedia("(pointer:fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var momentum = null; // set by the momentum-scroll feature; lets other features drive scrolling

  /* ---- 1. nav: transparent -> glass ---- */
  var nav = $("#nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
    var sp = $("#scrollProgress");
    if (sp) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      sp.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
    var tt = $("#toTop");
    if (tt) tt.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- 2. (active nav link is set by components.js — single source of truth) ---- */

  /* ---- 3. mobile menu ---- */
  var toggle = $("#navToggle"), links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open);
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) { links.classList.remove("open"); toggle.classList.remove("open"); }
    });
  }

  /* ---- 4. scroll reveal ---- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  $$(".reveal").forEach(function (el) { io.observe(el); });

  /* ---- 5. (background mouse-glow removed — solid background) ---- */

  /* ---- 6. inject scroll-progress + back-to-top ---- */
  (function () {
    var sp = document.createElement("div"); sp.className = "scroll-progress"; sp.id = "scrollProgress";
    document.body.appendChild(sp);
    var tt = document.createElement("button");
    tt.className = "to-top"; tt.id = "toTop"; tt.setAttribute("aria-label", "Back to top");
    tt.innerHTML = "↑";
    tt.addEventListener("click", function () { if (momentum) momentum.to(0); else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
    document.body.appendChild(tt);
  })();

  /* ---- 7. count-up numbers [data-count] ---- */
  function fmt(n, dec) { return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  var countIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; countIO.unobserve(el);
      var target = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suf = el.getAttribute("data-suffix") || "";
      var pre = el.getAttribute("data-prefix") || "";
      if (reduce) { el.textContent = pre + fmt(target, dec) + suf; return; }
      var dur = 1500, t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + fmt(target * eased, dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(function (el) { countIO.observe(el); });

  /* ---- 8. 3D tilt cards ---- */
  if (finePointer && !reduce) {
    $$(".tilt").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        el.style.transform = "translateY(-6px) perspective(700px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---- 9. testimonials carousel ---- */
  $$("[data-carousel]").forEach(function (c) {
    var slides = $$(".testimonial", c);
    if (!slides.length) return;
    var dots = document.createElement("div"); dots.className = "carousel__dots";
    var i = 0, timer;
    slides.forEach(function (s, idx) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Slide " + (idx + 1));
      b.addEventListener("click", function () { go(idx); rest(); });
      dots.appendChild(b);
    });
    c.appendChild(dots);
    function go(n) {
      slides[i].classList.remove("active"); dots.children[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active"); dots.children[i].classList.add("active");
    }
    function rest() { if (reduce) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5000); }
    go(0); rest();
  });

  /* ---- 10. seamless marquee (clone track) ---- */
  $$("[data-marquee] .marquee__track").forEach(function (tr) {
    tr.innerHTML += tr.innerHTML;
  });

  /* ---- 11. (ROI calculator removed) ---- */

  /* ---- 12. animated IoT network hero canvas ---- */
  (function () {
    var cv = $("#heroCanvas");
    if (!cv || reduce) return;
    var ctx = cv.getContext("2d"), w, h, pts, raf, running = false, onScreen = true;
    function size() {
      w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight;
      var count = Math.min(46, Math.round(w * h / 22000));   // capped: keeps the O(n²) link scan cheap
      pts = []; for (var k = 0; k < count; k++) pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
      });
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var a = 0; a < pts.length; a++) {
        var p = pts[a];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        for (var b = a + 1; b < pts.length; b++) {
          var q = pts[b], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.strokeStyle = "rgba(212,175,55," + (0.18 * (1 - d / 130)) + ")";
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(212,175,55,.8)";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }
    function start() { if (running) return; running = true; draw(); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    size(); start();
    window.addEventListener("resize", function () { stop(); size(); if (onScreen && !document.hidden) start(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (onScreen) start(); });
    if ("IntersectionObserver" in window) {   // stop the loop entirely once the hero scrolls off-screen
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        if (onScreen && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(cv);
    }
  })();

  /* ---- 13. (live fleet dashboard removed — the demo page is a video now) ---- */

  /* ---- 14. contact / quote form (posts JSON to /api/contact; mailto fallback) ---- */
  var form = $("#contactForm");
  if (form) {
    var msg = $("#formMsg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("[type=submit]");
      var fd = new FormData(form);
      var name = (fd.get("name") || "").toString();
      var first = name ? ", " + name.split(" ")[0] : "";
      var action = form.getAttribute("action") || "";
      // a usable endpoint = a real URL or a same-origin path (e.g. /api/contact),
      // and not the old Formspree placeholder.
      var isEndpoint = action && action.indexOf("YOUR_FORM_ID") === -1 &&
        (/^https?:/.test(action) || action.charAt(0) === "/");

      function ok() {
        if (msg) { msg.textContent = "Shukriya" + first + "! Aapki request mil gayi — hamari team 24 ghante mein rabta karegi."; msg.style.color = "var(--c6)"; }
        form.reset();
      }
      // never lose a lead: hand off to the visitor's email client
      function mailtoFallback() {
        var lines = [];
        fd.forEach(function (v, k) { if (k.charAt(0) !== "_") lines.push(k + ": " + v); });
        window.location.href = "mailto:hello@hacktech.pk?subject=" +
          encodeURIComponent("New enquiry — " + (fd.get("service") || "HackTech")) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        ok();
      }

      if (!isEndpoint) { mailtoFallback(); return; }

      var payload = {};
      fd.forEach(function (v, k) { payload[k] = v; });
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
      fetch(action, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", Accept: "application/json" }
      })
        .then(function (r) { if (r.ok) ok(); else mailtoFallback(); })  // backend not ready → fall back
        .catch(mailtoFallback)
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Get my quote"; } });
    });
  }

  /* ---- 15. smooth momentum scrolling (desktop + motion-ok; skips the 3D experience) ---- */
  (function () {
    if (reduce || !finePointer) return;
    if (document.body.getAttribute("data-page") === "tech") return;
    var target = window.scrollY, current = target, running = false;
    var EASE = 0.12;
    document.documentElement.style.scrollBehavior = "auto"; // JS owns smooth scrolling now
    function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
    function loop() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.4) { current = target; running = false; }
      window.scrollTo(0, current);
      if (running) requestAnimationFrame(loop);
    }
    function go(y) {
      target = Math.max(0, Math.min(y, maxScroll()));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    momentum = { to: go }; // expose so other features (back-to-top) drive the same engine
    function inScrollable(node) {
      while (node && node !== document.body && node.nodeType === 1) {
        var oy = getComputedStyle(node).overflowY;
        if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight) return true;
        node = node.parentElement;
      }
      return false;
    }
    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;                               // pinch-zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // leave horizontal native
      if (inScrollable(e.target)) return;                  // let inner scroll areas work
      if (e.target.closest && e.target.closest(".why-slider")) return; // Swiper owns the wheel here
      var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      go(target + e.deltaY * unit);
      e.preventDefault();
    }, { passive: false });
    // same-page anchors / skip-link animate through the same engine (+ move focus for a11y)
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href") === "#") return;
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      go(el.getBoundingClientRect().top + window.scrollY - 80);
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    });
    // keep the lerp target synced with native scrolls (keyboard, scrollbar, restore)
    function sync() { target = current = window.scrollY; running = false; }
    window.addEventListener("keydown", function (e) {
      if (/^(Arrow|Page|Home|End|Spacebar| )/.test(e.key)) requestAnimationFrame(sync);
    });
    window.addEventListener("scroll", function () { if (!running) sync(); }, { passive: true });
    window.addEventListener("resize", function () { target = Math.max(0, Math.min(target, maxScroll())); }, { passive: true });
    window.addEventListener("pageshow", sync);
    window.addEventListener("load", sync);
  })();

  /* ---- 16. magnetic primary buttons (capped; excludes the fixed nav CTA) ---- */
  (function () {
    if (reduce || !window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    var MAX = 8;
    $$(".btn--primary").forEach(function (b) {
      if (b.closest("#nav")) return; // don't tug the fixed nav button
      b.addEventListener("mouseenter", function () { b.classList.add("is-magnetic"); });
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var x = Math.max(-MAX, Math.min(MAX, (e.clientX - r.left - r.width / 2) * 0.2));
        var y = Math.max(-MAX, Math.min(MAX, (e.clientY - r.top - r.height / 2) * 0.25)) - 2;
        b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.classList.remove("is-magnetic"); b.style.transform = ""; });
      b.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") b.style.transform = ""; });
    });
  })();

  /* ---- 17. (robot mascot removed) ---- */

  /* ---- 18. (home robot scene removed) ---- */

  /* ---- 19. (cinematic scroll reveal removed) ---- */

  /* ---- 20. graceful card images: hide broken <img> so the gradient placeholder shows ---- */
  $$(".card__media img").forEach(function (im) {
    im.addEventListener("error", function () { im.style.display = "none"; });
  });

  onScroll();
})();

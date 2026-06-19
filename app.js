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

  /* ---- 11. fleet savings calculator ---- */
  (function () {
    var size = $("#fleetSize"), spend = $("#fuelSpend");
    if (!size || !spend) return;
    var SAVE = 0.18; // ~18% average fuel + route savings
    function rupees(n) { return "₨ " + Math.round(n).toLocaleString("en-US"); }
    function update() {
      var n = +size.value, s = +spend.value;
      var monthly = n * s * SAVE;
      var sv = $("#fleetSizeVal"), fv = $("#fuelSpendVal");
      if (sv) sv.textContent = n + (n >= 500 ? "+" : "") + " vehicles";
      if (fv) fv.textContent = "₨ " + (+s).toLocaleString("en-US") + "/mo";
      var m = $("#calcMonthly"), a = $("#calcAnnual"), co = $("#calcCo2");
      if (m) m.textContent = rupees(monthly);
      if (a) a.textContent = rupees(monthly * 12);
      if (co) co.textContent = Math.round(n * 1.9) + " t/yr";
    }
    size.addEventListener("input", update); spend.addEventListener("input", update); update();
  })();

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
            ctx.strokeStyle = "rgba(52,179,169," + (0.18 * (1 - d / 130)) + ")";
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(52,179,169,.8)";
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

  /* ---- 13. live fleet dashboard (demo page) ---- */
  (function () {
    var map = $("#fleetMap");
    if (!map) return;
    var N = 9, vehicles = [];
    for (var k = 0; k < N; k++) {
      var v = document.createElement("div"); v.className = "veh";
      v.style.left = Math.random() * 90 + "%"; v.style.top = Math.random() * 85 + "%";
      map.appendChild(v); vehicles.push(v);
    }
    var cities = ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Hyderabad", "Peshawar", "Quetta"];
    var events = [
      ["✓", "ok", "On-time delivery", "completed route"],
      ["⚡", "warn", "Harsh braking detected", "speed normalised"],
      ["⛽", "ok", "Fuel optimised", "route re-planned"],
      ["😴", "bad", "Driver fatigue alert", "rest reminder sent"],
      ["📍", "ok", "Geo-fence entered", "depot zone"],
      ["🌡", "warn", "Engine temp high", "diagnostics running"]
    ];
    function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
    function tickMap() {
      vehicles.forEach(function (v) {
        if (Math.random() < 0.55) {
          v.style.left = Math.max(2, Math.min(94, parseFloat(v.style.left) + (Math.random() - 0.5) * 24)) + "%";
          v.style.top = Math.max(2, Math.min(88, parseFloat(v.style.top) + (Math.random() - 0.5) * 22)) + "%";
        }
        v.className = "veh" + (Math.random() < 0.12 ? " warn" : Math.random() < 0.05 ? " bad" : "");
      });
    }
    function set(id, val) { var el = $(id); if (el) el.textContent = val; }
    function tickKpi() {
      set("#kpiActive", 230 + Math.floor(Math.random() * 24));
      set("#kpiSpeed", (58 + Math.floor(Math.random() * 16)) + " km/h");
      set("#kpiAlerts", Math.floor(Math.random() * 6));
      set("#kpiFuel", (12 + Math.floor(Math.random() * 7)) + "%");
    }
    var feed = $("#alertFeed");
    function tickFeed() {
      if (!feed) return;
      var e = rnd(events), c = rnd(cities);
      var el = document.createElement("div"); el.className = "alert";
      var ic = document.createElement("span"); ic.className = "ic"; ic.textContent = e[0];
      var wrap = document.createElement("span");
      var title = document.createElement("b"); title.textContent = e[2];
      var sub = document.createElement("small"); sub.textContent = c + " — " + e[3];
      wrap.appendChild(title); wrap.appendChild(sub);
      el.appendChild(ic); el.appendChild(wrap);
      feed.insertBefore(el, feed.firstChild);
      while (feed.children.length > 6) feed.removeChild(feed.lastChild);
    }
    var chart = $("#liveChart");
    function tickChart() {
      if (!chart) return;
      $$(".bar", chart).forEach(function (b) { b.style.height = (20 + Math.random() * 80) + "%"; });
    }
    tickKpi(); tickMap(); tickChart();
    for (var j = 0; j < 4; j++) tickFeed();
    if (!reduce) {
      var timers = [];
      function startDemo() { if (timers.length) return; timers = [setInterval(tickMap, 1500), setInterval(tickKpi, 2200), setInterval(tickFeed, 2600), setInterval(tickChart, 1800)]; }
      function stopDemo() { timers.forEach(clearInterval); timers = []; }
      startDemo();
      document.addEventListener("visibilitychange", function () { document.hidden ? stopDemo() : startDemo(); });
    }
  })();

  /* ---- 14. contact / quote form ---- */
  var form = $("#contactForm");
  if (form) {
    var msg = $("#formMsg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("[type=submit]");
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var first = name ? ", " + name.split(" ")[0] : "";
      var action = form.getAttribute("action") || "";
      var configured = /^https?:/.test(action) && action.indexOf("YOUR_FORM_ID") === -1;
      function ok() {
        if (msg) { msg.textContent = "Shukriya" + first + "! Aapki request mil gayi — hamari team 24 ghante mein rabta karegi."; msg.style.color = "var(--c6)"; }
        form.reset();
      }
      function fail() {
        if (msg) { msg.textContent = "Maaf kijiye — message abhi nahi bheja ja saka. Baraye meharbani hello@hacktech.pk par email karein."; msg.style.color = "#ff8d8d"; }
      }
      // No backend wired yet → open the user's email client so the lead is never lost.
      if (!configured) {
        var fd0 = new FormData(form), lines = [];
        fd0.forEach(function (v, k) { lines.push(k + ": " + v); });
        window.location.href = "mailto:hello@hacktech.pk?subject=" +
          encodeURIComponent("New enquiry — " + (fd0.get("service") || "HackTech")) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        ok();
        return;
      }
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
      fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { r.ok ? ok() : fail(); })
        .catch(fail)
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

  /* ---- 17. robot mascot: eyes follow cursor, idle life, talk bubbles, click -> contact ---- */
  (function () {
    var m = $("#mascot");
    if (!m) return;
    m.addEventListener("click", function () { window.location.href = "contact.html"; });
    if (reduce || !finePointer) return;
    var eyes = $(".mascot__eyes", m), svg = $(".mascot__svg", m), bubble = $("#mascotBubble", m);
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    window.addEventListener("mousemove", function (e) {
      var r = m.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.34);
      if (eyes) eyes.style.transform = "translate(" + clamp(dx / 50, -5, 5).toFixed(1) + "px," + clamp(dy / 50, -4, 4).toFixed(1) + "px)";
      if (svg) svg.style.setProperty("--tilt", clamp(dx / 42, -8, 8).toFixed(1) + "deg");
    }, { passive: true });
    // idle "life": occasional wave
    setInterval(function () {
      m.classList.add("is-waving");
      setTimeout(function () { m.classList.remove("is-waving"); }, 1500);
    }, 9000);
    // cycling speech bubbles
    var msgs = ["Hi! 👋", "Need a quote?", "Try the live demo →", "Made in Pakistan 🇵🇰", "Ask me anything"];
    var i = 0;
    function talk() {
      if (bubble) bubble.textContent = msgs[i++ % msgs.length];
      m.classList.add("is-talking");
      setTimeout(function () { m.classList.remove("is-talking"); }, 3400);
    }
    setTimeout(talk, 2600);
    setInterval(talk, 9000);
  })();

  /* ---- 18. home robot scene: flyer banks & descends with scroll, lifter heaves the page ---- */
  (function () {
    var scene = $(".robo-scene");
    if (!scene || reduce) return;
    var fly = $(".robo-fly", scene), lift = $(".robo-lift", scene);
    var armL = $(".lift-armL", scene), armR = $(".lift-armR", scene);
    var lastY = window.scrollY, vel = 0, ticking = false;
    function frame() {
      ticking = false;
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? y / max : 0;
      vel += ((y - lastY) - vel) * 0.25; lastY = y;
      var av = vel < 0 ? -vel : vel;
      if (fly) {
        var fx = Math.sin(p * 6.5) * 34;
        var fy = p * Math.max(0, window.innerHeight - 230);
        var bank = Math.max(-26, Math.min(26, vel * 1.4));
        fly.style.transform = "translate(" + fx.toFixed(1) + "px," + fy.toFixed(1) + "px) rotateY(" + bank.toFixed(1) + "deg) rotateZ(" + (bank * 0.35).toFixed(1) + "deg)";
      }
      if (lift) {
        lift.style.transform = "translateY(" + (-p * 10 - Math.min(av * 0.5, 8)).toFixed(1) + "px) scaleX(" + (1 + Math.min(av * 0.004, 0.06)).toFixed(3) + ")";
        var raise = p * 52 + Math.min(av * 0.8, 12);
        if (armL) armL.style.transform = "rotate(" + (-raise).toFixed(1) + "deg)";
        if (armR) armR.style.transform = "rotate(" + raise.toFixed(1) + "deg)";
      }
      if (av > 0.15) { ticking = true; requestAnimationFrame(frame); }
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    frame();
  })();

  /* ---- 19. cinematic scroll reveal: panel scales to full-screen + caption reveals ---- */
  (function () {
    var cine = $(".cine");
    if (!cine || reduce) return;
    var panel = $(".cine__panel", cine), overlay = $(".cine__overlay", cine), content = $(".cine__content", cine);
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    var ticking = false;
    function render() {
      ticking = false;
      var vh = window.innerHeight, r = cine.getBoundingClientRect(), total = cine.offsetHeight - vh;
      var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      var s = clamp(p / 0.55, 0, 1);
      var maxW = Math.min(window.innerWidth * 0.92, 1180);
      if (panel) {
        panel.style.width = lerp(300, maxW, s).toFixed(0) + "px";
        panel.style.height = lerp(300, vh * 0.82, s).toFixed(0) + "px";
        panel.style.borderRadius = lerp(26, 10, s).toFixed(0) + "px";
      }
      var o = clamp((p - 0.5) / 0.38, 0, 1);
      if (overlay) overlay.style.clipPath = "inset(" + ((1 - o) * 100).toFixed(1) + "% 0 0 0)";
      if (content) {
        content.style.opacity = o.toFixed(3);
        content.style.filter = "blur(" + lerp(10, 0, o).toFixed(1) + "px)";
        content.style.transform = "scale(" + lerp(1.08, 1, o).toFixed(3) + ")";
      }
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req, { passive: true });
    render();
  })();

  /* ---- 20. graceful card images: hide broken <img> so the gradient placeholder shows ---- */
  $$(".card__media img").forEach(function (im) {
    im.addEventListener("error", function () { im.style.display = "none"; });
  });

  onScroll();
})();

/* ============================================================
   HACKTECH — enhancement layer (additive, self-contained)
   Loaded LAST. Every block is guarded; if anything here throws
   or is unsupported, the base site keeps working untouched.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var root = document.documentElement;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  if (!reduce) root.classList.add("fx-on");   // unlocks the scroll-parallax CSS

  /* ---- custom cursor removed — the site uses the normal system cursor ---- */

  /* ---- 2. holographic sheen: light that follows the cursor across glass ---- */
  (function () {
    if (reduce || !finePointer) return;
    var SURFACES = ".card,.kpi,.calc,.dash,.split__media,.step,.cta,.testimonial";
    $$(SURFACES).filter(function (el) {
      // photos keep their own wash/scanline treatment — the generic sheen
      // would lift the <img> above those overlays, so skip them.
      return !el.classList.contains("media-photo");
    }).forEach(function (el) {
      el.classList.add("fx-sheen");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerenter", function () { el.classList.add("is-live"); });
      el.addEventListener("pointerleave", function () { el.classList.remove("is-live"); });
    });
  })();

  /* ---- 3. photo reveal + gentle scroll parallax ---- */
  (function () {
    var shots = $$(".media-photo");
    if (!shots.length) return;

    // fade/rise in (mirrors the site's .reveal behaviour)
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      shots.forEach(function (s) { s.classList.add("reveal-img"); io.observe(s); });
    } else {
      shots.forEach(function (s) { s.classList.add("reveal-img", "show"); });
    }

    if (reduce) return;
    var ticking = false;
    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      shots.forEach(function (s) {
        var img = s.firstElementChild;
        if (!img || img.tagName !== "IMG") return;
        var r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;          // off-screen → skip
        var centered = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 through viewport
        img.style.setProperty("--py", (centered * -22).toFixed(1) + "px");
      });
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req, { passive: true });
    frame();
  })();

  /* ---- 4. videos: play only when on-screen (defers load + saves CPU); honour reduced-motion ---- */
  (function () {
    var vids = $$(".hero-portal__vid, .js-inview-video");
    if (!vids.length) return;
    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.15 }) : null;
    vids.forEach(function (v) {
      if (reduce) { try { v.pause(); v.removeAttribute("autoplay"); } catch (e) {} return; }
      if (io) io.observe(v);
      else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  })();

  /* ---- 5. demo video: custom volume-only (mute/unmute) toggle ---- */
  (function () {
    var v = document.querySelector(".demo-video__vid");
    var btn = document.getElementById("demoMute");
    if (!v || !btn) return;
    btn.addEventListener("click", function () {
      v.muted = !v.muted;
      if (!v.muted) { v.volume = 1; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      btn.classList.toggle("is-on", !v.muted);
      btn.setAttribute("aria-pressed", String(!v.muted));
      btn.setAttribute("aria-label", v.muted ? "Unmute video" : "Mute video");
    });
  })();

  /* ---- 6. team accordion: expanding flex cards + cursor-driven 3D tilt ---- */
  (function () {
    var acc = document.querySelector(".team-accordion");
    if (!acc) return;
    var cards = $$(".tcard", acc);
    if (!cards.length) return;

    function activate(card) {
      cards.forEach(function (c) {
        var on = c === card;
        c.classList.toggle("is-active", on);
        if (!on) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
      });
    }
    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () { activate(card); });
      card.addEventListener("focus", function () { activate(card); });
      card.addEventListener("click", function () { activate(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(card); }
      });
    });
    // resting state: feature the first card (mirrors the reference's default-open card)
    var def = cards[0];
    acc.addEventListener("mouseleave", function () { activate(def); });

    /* 3D tilt — pointer devices, motion-ok only */
    if (reduce || !finePointer) return;
    var raf = null, curr = null, rx = "0", ry = "0";
    function apply() {
      raf = null;
      if (curr) { curr.style.setProperty("--rx", rx + "deg"); curr.style.setProperty("--ry", ry + "deg"); }
    }
    acc.addEventListener("pointermove", function (e) {
      curr = acc.querySelector(".tcard.is-active");
      if (!curr) return;
      var r = curr.getBoundingClientRect();
      rx = (((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2);
      ry = (((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2);
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    acc.addEventListener("pointerleave", function () {
      cards.forEach(function (c) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); });
    });
  })();

  /* ---- 7. rotating edge-light: a bright line orbiting every card/box ---- */
  (function () {
    var TARGETS = ".card,.step,.kpi,.stat,.tcard,.cta,.pf-show__media,.media-photo";
    var orbs = [];
    $$(TARGETS).forEach(function (el) {
      if (el.querySelector(":scope > .ht-orbit")) return;            // already done
      el.classList.add("has-orbit");
      var o = document.createElement("i");
      o.className = "ht-orbit";
      o.setAttribute("aria-hidden", "true");
      el.appendChild(o);
      orbs.push(o);
    });
    // perf: only animate the lines that are actually on screen — keeps scroll
    // smooth no matter how many cards are on the page.
    if (!reduce && orbs.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.target.style.animationPlayState = e.isIntersecting ? "running" : "paused";
        });
      }, { rootMargin: "150px" });
      orbs.forEach(function (o) { o.style.animationPlayState = "paused"; io.observe(o); });
    }
  })();

  /* ---- 8. focus-on-hover: hovered grid card zooms forward, the rest blur ----
     Driven by JS classes (not :has()) so it works in every browser. Gated on
     (hover:hover) so it covers mice/trackpads incl. 2-in-1s, off on touch. */
  (function () {
    if (!window.matchMedia("(hover:hover)").matches) return;
    $$(".grid--2,.grid--3,.grid--4").forEach(function (grid) {
      var cards = $$(":scope > .card", grid);
      if (cards.length < 2) return;                 // nothing to blur against
      cards.forEach(function (card) {
        card.addEventListener("pointerenter", function () {
          card.classList.add("ht-up");
          grid.classList.add("ht-focus");
        });
        card.addEventListener("pointerleave", function () {
          card.classList.remove("ht-up");
          grid.classList.remove("ht-focus");
        });
      });
    });
  })();

})();

/* ============================================================
   KAIRA — cinematic 3D mascot launcher (Three.js, classic UMD)
   Uses the global THREE (loaded by veyra.js) — no ES modules.

   3-tier mascot, most-specific first, each falls back to the next:
     1) models/kaira-cat/kaira-cat.gltf — the real 3D mascot model.
        Loads and takes over automatically (GLTFLoader). Uses the
        .gltf + external .bin/.png form (not a single .glb) on purpose:
        GLTFLoader decodes embedded/binary-chunk images via a blob-URL
        + createImageBitmap path that is unreliable in some browser
        contexts; external image files load through the plain, robust
        <img> element path instead. To swap in a different model:
          npx @gltf-transform/cli resize --width 512 --height 512 in.glb resized.glb
          npx @gltf-transform/cli copy resized.glb models/kaira-cat/kaira-cat.gltf
        (resize first — source files can be 30MB+ with 4K textures,
        which is both slow and unnecessary for a ~150px launcher.)
     2) procedural cyber-cat — 100% code geometry, no files. Only
        applies its cat-specific parts (ears/tail/eyes/blink) when
        this tier is the one actually built — see `parts` below.
     3) CSS energy orb — if WebGL is unavailable.

   CINEMATIC LAYER (applies to tier 1 & 2):
     · ACES filmic tone mapping — richer, film-like color
     · 4-light rig: white key, violet rim, orbiting cyan accent,
       breathing under-glow (colors match the .vy widget palette)
     · floating soul-particles (additive Points) swirling around
       the mascot — drift up, respawn, surge on hover/click
     · ground glow disc that breathes with the idle bob
     · layered idle: bob + sway + micro-roll, and a slow "look
       around" wander when the pointer has been still for a while
     · hover surge (lights + particles + lift), click power-pulse
     · camera micro-drift for cinematic depth
   All motion honors prefers-reduced-motion (static pose, frozen
   dim particles, fixed lights/camera). Click opens chat (veyra).
   ============================================================ */
(function () {
  "use strict";
  var THREE = window.THREE;
  var stage = document.getElementById("kaira-stage");
  var vyRoot = document.querySelector(".vy");
  if (!THREE || !stage || !vyRoot) return;

  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }
  if (!hasWebGL()) return;

  var W = stage.clientWidth || 164;
  var H = stage.clientHeight || 184;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);
  var CAM = { x: 0, y: 1.25, z: 6.4 };
  camera.position.set(CAM.x, CAM.y, CAM.z);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if (THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  // film-like response instead of raw linear — deeper shadows, softer highlights
  if (THREE.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
  }
  renderer.domElement.style.pointerEvents = "none";
  stage.appendChild(renderer.domElement);

  // ---- Light rig: white key / violet rim (matches the widget's --vy-violet)
  // / orbiting cyan accent / breathing violet under-glow.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223047, 1.0));
  var key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(3, 6, 5);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0x8a63ff, 1.6);
  rim.position.set(-5, 2, -4);
  scene.add(rim);
  var accent = new THREE.PointLight(0x2fe0e0, 0.65, 9);
  accent.position.set(2.6, 1.2, 0);
  scene.add(accent);
  var underGlow = new THREE.PointLight(0x7c5cff, 0.55, 5);
  underGlow.position.set(0, -1.1, 0.7);
  scene.add(underGlow);

  // ---- Soft round sprite for particles + ground disc (canvas radial glow).
  function glowTexture(inner, mid) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, mid);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  // ---- Shared state (filled once a mascot is built; async for the GLTF).
  var cat = null;      // root object (GLTF scene OR procedural group)
  var parts = null;    // procedural sub-parts (null when the GLTF is used)
  var mixer = null;    // GLTF animation mixer (if the model ships clips)
  var baseY = 0;
  var baseScale = 1;
  var cinema = null;   // { points, seeds, ground } — built with the mascot
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  // Fit the max dimension to ~2.95, recenter, sit slightly up — same
  // normalize contract for both tiers. Then dress the stage around it.
  function normalizeAndMount(obj) {
    obj.traverse(function (o) {
      if (o.isMesh) {
        o.frustumCulled = false;
        if (o.material && o.material.map) o.material.map.anisotropy = 4;
      }
    });
    var box = new THREE.Box3().setFromObject(obj);
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    baseScale = 2.95 / Math.max(size.x, size.y, size.z);
    obj.scale.setScalar(baseScale);
    obj.position.sub(center.multiplyScalar(baseScale));
    baseY = obj.position.y + 0.05;
    scene.add(obj);
    cat = obj;
    buildCinema();
    vyRoot.classList.add("vy-3d");
  }

  // ---- The stagecraft: soul-particles + breathing ground glow. Built only
  // after a mascot exists so the orb fallback never shows floating dust.
  function buildCinema() {
    var N = 54;
    var pos = new Float32Array(N * 3);
    var seeds = [];
    for (var i = 0; i < N; i++) {
      seeds.push({
        a: Math.random() * Math.PI * 2,            // orbit angle
        r: 0.7 + Math.random() * 1.0,              // orbit radius
        y: -1.4 + Math.random() * 3.2,             // height
        vy: 0.14 + Math.random() * 0.22,           // rise speed
        va: (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.3), // swirl speed
        s: 0.5 + Math.random() * 0.5               // per-particle shimmer phase
      });
      pos[i * 3] = Math.cos(seeds[i].a) * seeds[i].r;
      pos[i * 3 + 1] = seeds[i].y;
      pos[i * 3 + 2] = Math.sin(seeds[i].a) * seeds[i].r;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var pMat = new THREE.PointsMaterial({
      size: 0.11,
      map: glowTexture("rgba(255,255,255,.95)", "rgba(155,123,255,.55)"),
      transparent: true,
      opacity: reduce ? 0.22 : 0.0,   // fades in with the entrance
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xb9a4ff
    });
    var points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: glowTexture("rgba(155,123,255,.85)", "rgba(124,92,255,.35)"),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.42;
    scene.add(ground);

    cinema = { points: points, geo: pGeo, mat: pMat, seeds: seeds, ground: ground };
  }

  // ============================================================
  // (1) GLTF model, if present. onError (incl. 404) → procedural cat.
  // ============================================================
  function useGLB(gltf) {
    normalizeAndMount(gltf.scene);
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      var byName = {};
      gltf.animations.forEach(function (c) { byName[c.name] = c; });
      var idle = byName["Idle"] || byName["Dance"] || gltf.animations[0];
      if (idle) mixer.clipAction(idle).play();
    }
  }

  // ============================================================
  // (2) Procedural cyberpunk soldier cat — code geometry only.
  // ============================================================
  function buildProceduralCat() {
    var matArmor  = new THREE.MeshStandardMaterial({ color: 0x14171f, metalness: 0.6,  roughness: 0.35 });
    var matSuit   = new THREE.MeshStandardMaterial({ color: 0x1a1d28, metalness: 0.25, roughness: 0.65 });
    var matJacket = new THREE.MeshStandardMaterial({ color: 0xff9a3c, metalness: 0.12, roughness: 0.5  });
    var matTrim   = new THREE.MeshStandardMaterial({ color: 0xd97a26, metalness: 0.15, roughness: 0.55 });
    var matEarIn  = new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.6, emissive: 0xff9a3c, emissiveIntensity: 0.25 });
    var matVisor  = new THREE.MeshStandardMaterial({ color: 0x0c0f16, metalness: 0.8,  roughness: 0.2  });
    var matEye    = new THREE.MeshStandardMaterial({ color: 0x0b1410, emissive: 0x5cff9d, emissiveIntensity: 1.6 });
    var matCyan   = new THREE.MeshStandardMaterial({ color: 0x06222c, emissive: 0x59e0ff, emissiveIntensity: 1.2 });
    var matGlowOr = new THREE.MeshStandardMaterial({ color: 0x2a1503, emissive: 0xff9a3c, emissiveIntensity: 0.9 });

    function mesh(geo, mat, x, y, z, parent) {
      var m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      parent.add(m);
      return m;
    }

    var group = new THREE.Group();

    var torso = new THREE.Group();
    torso.position.set(0, 0.62, 0);
    group.add(torso);
    mesh(new THREE.BoxGeometry(1.0, 1.0, 0.72), matSuit, 0, 0, 0, torso);
    mesh(new THREE.BoxGeometry(1.14, 0.72, 0.84), matJacket, 0, 0.18, 0, torso);
    mesh(new THREE.BoxGeometry(0.34, 0.74, 0.06), matSuit, 0, 0.16, 0.44, torso);
    mesh(new THREE.BoxGeometry(0.16, 0.22, 0.05), matCyan, 0, 0.22, 0.47, torso);
    var collar = mesh(new THREE.TorusGeometry(0.34, 0.09, 8, 18), matTrim, 0, 0.56, 0, torso);
    collar.rotation.x = Math.PI / 2;
    mesh(new THREE.BoxGeometry(1.06, 0.16, 0.78), matArmor, 0, -0.5, 0, torso);
    mesh(new THREE.BoxGeometry(0.2, 0.1, 0.06), matGlowOr, 0, -0.5, 0.4, torso);
    var padGeo = new THREE.SphereGeometry(0.24, 12, 10);
    var padL = mesh(padGeo, matJacket, -0.62, 0.42, 0, torso); padL.scale.set(1, 0.8, 1);
    var padR = mesh(padGeo, matJacket,  0.62, 0.42, 0, torso); padR.scale.set(1, 0.8, 1);

    mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.26, 12), matSuit, 0, 1.26, 0, group);

    var head = new THREE.Group();
    head.position.set(0, 1.32, 0);
    group.add(head);
    var helmet = mesh(new THREE.SphereGeometry(0.78, 20, 16), matArmor, 0, 0.45, 0, head);
    helmet.scale.set(1, 0.84, 0.92);
    mesh(new THREE.BoxGeometry(1.06, 0.5, 0.2), matVisor, 0, 0.42, 0.58, head);
    mesh(new THREE.BoxGeometry(0.7, 0.08, 0.1), matJacket, 0, 0.76, 0.5, head);
    mesh(new THREE.BoxGeometry(0.66, 0.2, 0.42), matSuit, 0, 0.02, 0.36, head);
    mesh(new THREE.BoxGeometry(0.07, 0.14, 0.05), matCyan, -0.56, 0.3, 0.5, head);
    mesh(new THREE.BoxGeometry(0.07, 0.14, 0.05), matCyan,  0.56, 0.3, 0.5, head);

    var eyeGeo = new THREE.SphereGeometry(0.21, 16, 12);
    var rimGeo = new THREE.TorusGeometry(0.22, 0.035, 8, 20);
    var eyes = [];
    [-0.28, 0.28].forEach(function (x) {
      var e = mesh(eyeGeo, matEye, x, 0.45, 0.66, head);
      e.scale.set(1, 1, 0.5);
      eyes.push(e);
      mesh(rimGeo, matArmor, x, 0.45, 0.72, head);
    });
    var eyeLight = new THREE.PointLight(0x5cff9d, 0.9, 3.5);
    eyeLight.position.set(0, 0.45, 1.05);
    head.add(eyeLight);

    function buildEar(side) {
      var ear = new THREE.Group();
      ear.position.set(0.5 * side, 0.98, 0);
      ear.rotation.z = -0.22 * side;
      var outer = mesh(new THREE.ConeGeometry(0.26, 0.55, 4), matArmor, 0, 0.24, 0, ear);
      outer.rotation.y = Math.PI / 4;
      var inner = mesh(new THREE.ConeGeometry(0.14, 0.32, 4), matEarIn, 0, 0.17, 0.1, ear);
      inner.rotation.y = Math.PI / 4;
      head.add(ear);
      return ear;
    }
    var earR = buildEar(1);
    var earL = buildEar(-1);

    function buildArm(side) {
      var arm = new THREE.Group();
      arm.position.set(0.66 * side, 1.02, 0);
      arm.rotation.z = -0.14 * side;
      mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.55, 10), matSuit, 0, -0.3, 0, arm);
      mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.1, 10), matJacket, 0, -0.48, 0, arm);
      mesh(new THREE.SphereGeometry(0.16, 12, 10), matArmor, 0, -0.62, 0, arm);
      group.add(arm);
      return arm;
    }
    var armR = buildArm(1);
    var armL = buildArm(-1);

    function buildLeg(side) {
      var leg = new THREE.Group();
      leg.position.set(0.3 * side, 0.14, 0);
      mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.42, 10), matSuit, 0, -0.22, 0, leg);
      mesh(new THREE.BoxGeometry(0.36, 0.06, 0.52), matJacket, 0, -0.4, 0.06, leg);
      mesh(new THREE.BoxGeometry(0.34, 0.24, 0.5), matArmor, 0, -0.52, 0.06, leg);
      group.add(leg);
    }
    buildLeg(1);
    buildLeg(-1);

    var tail = new THREE.Group();
    tail.position.set(0, 0.35, -0.42);
    group.add(tail);
    var tailRoot = mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.35, 8), matSuit, 0, -0.05, -0.12, tail);
    tailRoot.rotation.x = 1.15;
    var curl = mesh(new THREE.TorusGeometry(0.28, 0.055, 8, 24, Math.PI * 1.5), matSuit, 0, 0.18, -0.3, tail);
    curl.rotation.y = Math.PI / 2 - 0.35;
    var tipA = Math.PI * 1.5;
    mesh(new THREE.SphereGeometry(0.075, 10, 8), matGlowOr, Math.cos(tipA) * 0.28, Math.sin(tipA) * 0.28, 0, curl);

    parts = { torso: torso, head: head, eyes: eyes, matEye: matEye, eyeLight: eyeLight, tail: tail, armL: armL, armR: armR, earL: earL, earR: earR };
    normalizeAndMount(group);
  }

  // Pick the mascot: try the real model first, fall back to procedural.
  if (THREE.GLTFLoader) {
    try {
      new THREE.GLTFLoader().load("/models/kaira-cat/kaira-cat.gltf", useGLB, undefined, buildProceduralCat);
    } catch (e) {
      buildProceduralCat();
    }
  } else {
    buildProceduralCat();
  }

  // ============================================================
  // Interaction + animation.
  // ============================================================
  var clock = new THREE.Clock();
  var target = { x: 0, y: 0 };
  var hover = 0;
  var hoverTarget = 0;
  var surge = 0;              // click power-pulse, decays each frame
  var lastMove = 0;           // seconds timestamp of last pointer move

  var launch = document.querySelector(".vy-launch");
  if (launch) {
    launch.addEventListener("mouseenter", function () { hoverTarget = 1; });
    launch.addEventListener("mouseleave", function () { hoverTarget = 0; });
    launch.addEventListener("click", function () { surge = 1; });
  }

  window.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width / 2)) / Math.max(window.innerWidth, 1);
    var dy = (e.clientY - (r.top + r.height / 2)) / Math.max(window.innerHeight, 1);
    target.y = Math.max(-0.7, Math.min(0.7, dx * 2.2));
    target.x = Math.max(-0.32, Math.min(0.32, dy * 1.3));
    lastMove = t;
  }, { passive: true });

  window.addEventListener("resize", function () {
    W = stage.clientWidth || W;
    H = stage.clientHeight || H;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });

  var t = 0;
  var intro = reduce ? 1 : 0;
  var nextBlink = 2.6;
  var blinkT = -1;
  var BLINK_DUR = 0.16;
  var nextTwitch = 4.5;
  var twitchT = -1;
  var TWITCH_DUR = 0.4;
  var twitchEar = null;

  function easeOutBack(p) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  }

  (function loop() {
    requestAnimationFrame(loop);
    var dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    hover += (hoverTarget - hover) * 0.12;
    surge = Math.max(0, surge - dt * 2.2);
    if (mixer) mixer.update(dt);

    // ---- Stagecraft runs as soon as it exists (even while GLTF loads).
    if (cinema && !reduce) {
      var pos = cinema.geo.attributes.position.array;
      var boost = 1 + hover * 1.4 + surge * 2.5;
      for (var i = 0; i < cinema.seeds.length; i++) {
        var s = cinema.seeds[i];
        s.y += s.vy * boost * dt;
        s.a += s.va * boost * dt;
        if (s.y > 1.9) s.y = -1.45;              // recycle at the top
        pos[i * 3] = Math.cos(s.a) * s.r;
        pos[i * 3 + 1] = s.y;
        pos[i * 3 + 2] = Math.sin(s.a) * s.r;
      }
      cinema.geo.attributes.position.needsUpdate = true;
      // fade in with the entrance; shimmer + brighten under attention
      cinema.mat.opacity = Math.min(intro, 1) * (0.5 + Math.sin(t * 2.6) * 0.12 + hover * 0.3 + surge * 0.4);
      cinema.ground.material.opacity = 0.38 + Math.sin(t * 1.7) * 0.1 + hover * 0.25 + surge * 0.3;
      var gs = 1 + Math.sin(t * 1.7) * 0.05 + surge * 0.18;
      cinema.ground.scale.set(gs, gs, 1);
    }

    // ---- Lights breathe; accent orbits slowly.
    if (!reduce) {
      accent.position.set(Math.cos(t * 0.4) * 2.6, 1.2 + Math.sin(t * 0.9) * 0.3, Math.sin(t * 0.4) * 2.6);
      accent.intensity = 0.55 + Math.sin(t * 1.3) * 0.15 + hover * 0.5 + surge * 0.8;
      underGlow.intensity = 0.45 + Math.sin(t * 1.7) * 0.15 + hover * 0.4 + surge * 0.9;
      rim.intensity = 1.5 + hover * 0.5 + surge * 0.6;
      // camera micro-drift — barely-there handheld feel
      camera.position.x = CAM.x + Math.sin(t * 0.23) * 0.05;
      camera.position.y = CAM.y + Math.sin(t * 0.31) * 0.035;
      camera.lookAt(0, 0.1, 0);
    }

    if (!cat) { renderer.render(scene, camera); return; }   // model still loading

    // ---- Entrance pop + layered idle (bob + sway + micro-roll).
    if (intro < 1) intro = Math.min(intro + dt / 0.65, 1);
    var pop = easeOutBack(intro);
    var settle = 1 - intro;
    var bob = reduce ? 0 : Math.sin(t * 1.7) * 0.06;
    var pulse = 1 + surge * 0.06;                            // click power-pulse
    cat.scale.setScalar(baseScale * (0.6 + 0.4 * pop) * pulse);
    cat.position.y = baseY + bob + hover * 0.12 - settle * 0.35;
    if (!reduce) {
      cat.position.x = Math.sin(t * 0.6) * 0.03;             // gentle sway
      cat.rotation.z = Math.sin(t * 0.8) * 0.02;             // micro-roll
    }

    // ---- Where to look: the pointer — or wander when it's been idle.
    var idle = !reduce && (t - lastMove) > 5;
    var lookY = idle ? Math.sin(t * 0.33) * 0.42 : target.y;
    var lookX = idle ? Math.sin(t * 0.21) * 0.10 : target.x;

    if (reduce) {
      cat.rotation.set(0, 0, 0);
      if (parts) {
        parts.head.rotation.set(0, 0, 0);
        parts.matEye.emissiveIntensity = 1.6 + hover * 0.6;
        parts.eyeLight.intensity = 0.9 + hover * 0.5;
      }
    } else {
      cat.rotation.y += (lookY * 0.45 - cat.rotation.y) * 0.07;
      cat.rotation.x += (lookX * 0.35 - cat.rotation.x) * 0.07;

      if (parts) {
        if (!twitchEar) twitchEar = parts.earL;
        parts.head.rotation.y += (lookY * 0.55 - parts.head.rotation.y) * 0.11;
        parts.head.rotation.x += (lookX * 0.6 - parts.head.rotation.x) * 0.11;
        parts.torso.scale.y = 1 + Math.sin(t * 2.1) * 0.012;

        var glow = 1.5 + Math.sin(t * 2.4) * 0.25 + hover * 0.9 + surge * 1.2;
        if (blinkT >= 0) {
          blinkT += dt;
          var k = Math.sin(Math.PI * Math.min(blinkT / BLINK_DUR, 1));
          glow *= 1 - k * 0.8;
          parts.eyes[0].scale.y = parts.eyes[1].scale.y = 1 - k * 0.85;
          if (blinkT >= BLINK_DUR) {
            blinkT = -1;
            parts.eyes[0].scale.y = parts.eyes[1].scale.y = 1;
            nextBlink = t + 2.4 + Math.random() * 3.6;
          }
        } else if (t >= nextBlink) {
          blinkT = 0;
        }
        parts.matEye.emissiveIntensity = glow;
        parts.eyeLight.intensity = 0.7 + glow * 0.25;

        parts.tail.rotation.y = Math.sin(t * 1.3) * 0.28;
        parts.tail.rotation.x = Math.sin(t * 0.9 + 1.2) * 0.08;
        parts.armL.rotation.z = 0.14 + Math.sin(t * 1.7) * 0.03;
        parts.armR.rotation.z = -0.14 - Math.sin(t * 1.7 + 0.6) * 0.03;

        var perk = 1 - hover * 0.5;
        parts.earL.rotation.z = 0.22 * perk;
        parts.earR.rotation.z = -0.22 * perk;
        parts.earL.rotation.x = parts.earR.rotation.x = -0.12 * hover;
        if (twitchT >= 0) {
          twitchT -= dt;
          if (twitchT <= 0) {
            twitchT = -1;
            nextTwitch = t + 4 + Math.random() * 5;
          } else {
            var w = twitchT / TWITCH_DUR;
            twitchEar.rotation.z += Math.sin(w * Math.PI * 3) * 0.2 * w;
          }
        } else if (t >= nextTwitch) {
          twitchT = TWITCH_DUR;
          twitchEar = Math.random() < 0.5 ? parts.earL : parts.earR;
        }
      }
    }

    renderer.render(scene, camera);
  })();
})();

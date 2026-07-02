/* ============================================================
   KAIRA — 3D cyberpunk soldier cat launcher (Three.js, classic build)
   Uses the global THREE (loaded as a UMD script by veyra.js) — no
   ES modules / import maps, so it loads reliably across browsers.
   The mascot is 100% procedural geometry (boxes / spheres / cones /
   cylinders / tori) — no model files, no GLTFLoader. Idle breathing,
   cursor-follow head, glowing green goggle eyes with blink, tail
   sway, ear twitch + hover perk. Click opens chat (handled by veyra).
   If WebGL is unavailable, the CSS fallback orb stays.
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
  camera.position.set(0, 1.25, 6.4);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else if (THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  renderer.domElement.style.pointerEvents = "none";
  stage.appendChild(renderer.domElement);

  // ---- Lights: soft hemi fill + white key + warm orange rim so the
  // graphite armor and orange jacket both read against the dark UI.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223047, 1.15));
  var key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(3, 6, 5);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xff8a3d, 1.35);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  // ============================================================
  // Materials — graphite armor / dark suit / orange cyber jacket /
  // emissive green optics / small cyan + orange accent lights.
  // ============================================================
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

  // ============================================================
  // Build the cat. Chibi proportions: big helmeted head, stubby
  // limbs, curled cable tail. All parts hang off `cat` (root) so
  // whole-body yaw/bob is one transform; `head`, ears, tail and
  // limbs are sub-groups so they animate independently.
  // ============================================================
  var cat = new THREE.Group();

  // ---- Torso: dark tactical undersuit + orange cyber jacket over it.
  var torso = new THREE.Group();
  torso.position.set(0, 0.62, 0);
  cat.add(torso);
  mesh(new THREE.BoxGeometry(1.0, 1.0, 0.72), matSuit, 0, 0, 0, torso);              // undersuit core
  mesh(new THREE.BoxGeometry(1.14, 0.72, 0.84), matJacket, 0, 0.18, 0, torso);        // orange jacket shell
  mesh(new THREE.BoxGeometry(0.34, 0.74, 0.06), matSuit, 0, 0.16, 0.44, torso);       // open-front zipper strip
  mesh(new THREE.BoxGeometry(0.16, 0.22, 0.05), matCyan, 0, 0.22, 0.47, torso);       // cyan chest core light
  var collar = mesh(new THREE.TorusGeometry(0.34, 0.09, 8, 18), matTrim, 0, 0.56, 0, torso);
  collar.rotation.x = Math.PI / 2;                                                    // orange collar ring
  mesh(new THREE.BoxGeometry(1.06, 0.16, 0.78), matArmor, 0, -0.5, 0, torso);         // tactical belt
  mesh(new THREE.BoxGeometry(0.2, 0.1, 0.06), matGlowOr, 0, -0.5, 0.4, torso);        // glowing buckle
  var padGeo = new THREE.SphereGeometry(0.24, 12, 10);
  var padL = mesh(padGeo, matJacket, -0.62, 0.42, 0, torso); padL.scale.set(1, 0.8, 1); // shoulder pads
  var padR = mesh(padGeo, matJacket,  0.62, 0.42, 0, torso); padR.scale.set(1, 0.8, 1);

  // ---- Neck.
  mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.26, 12), matSuit, 0, 1.26, 0, cat);

  // ---- Head: pivot at the neck so cursor-follow rotates naturally.
  var head = new THREE.Group();
  head.position.set(0, 1.32, 0);
  cat.add(head);
  var helmet = mesh(new THREE.SphereGeometry(0.78, 20, 16), matArmor, 0, 0.45, 0, head);
  helmet.scale.set(1, 0.84, 0.92);                                                    // rounded armored helmet
  mesh(new THREE.BoxGeometry(1.06, 0.5, 0.2), matVisor, 0, 0.42, 0.58, head);         // dark goggle band
  mesh(new THREE.BoxGeometry(0.7, 0.08, 0.1), matJacket, 0, 0.76, 0.5, head);         // orange brow ridge
  mesh(new THREE.BoxGeometry(0.66, 0.2, 0.42), matSuit, 0, 0.02, 0.36, head);         // jaw / muzzle plate
  mesh(new THREE.BoxGeometry(0.07, 0.14, 0.05), matCyan, -0.56, 0.3, 0.5, head);      // cyan cheek vents
  mesh(new THREE.BoxGeometry(0.07, 0.14, 0.05), matCyan,  0.56, 0.3, 0.5, head);

  // Big glowing green goggle eyes — the signature feature. Flattened
  // emissive spheres inside dark torus rims, plus a green point light.
  var eyeGeo = new THREE.SphereGeometry(0.21, 16, 12);
  var rimGeo = new THREE.TorusGeometry(0.22, 0.035, 8, 20);
  var eyes = [];
  [-0.28, 0.28].forEach(function (x) {
    var e = mesh(eyeGeo, matEye, x, 0.45, 0.66, head);
    e.scale.set(1, 1, 0.5);
    eyes.push(e);
    mesh(rimGeo, matArmor, x, 0.45, 0.72, head);                                      // goggle rims face +z
  });
  var eyeLight = new THREE.PointLight(0x5cff9d, 0.9, 3.5);
  eyeLight.position.set(0, 0.45, 1.05);
  head.add(eyeLight);

  // Pointy cat ears: dark 4-sided pyramid outside, orange inner cone.
  function buildEar(side) {
    var ear = new THREE.Group();
    ear.position.set(0.5 * side, 0.98, 0);
    ear.rotation.z = -0.22 * side;                                                    // rest tilt, slightly outward
    var outer = mesh(new THREE.ConeGeometry(0.26, 0.55, 4), matArmor, 0, 0.24, 0, ear);
    outer.rotation.y = Math.PI / 4;
    var inner = mesh(new THREE.ConeGeometry(0.14, 0.32, 4), matEarIn, 0, 0.17, 0.1, ear);
    inner.rotation.y = Math.PI / 4;
    head.add(ear);
    return ear;
  }
  var earR = buildEar(1);
  var earL = buildEar(-1);

  // ---- Stubby arms: pivot at the shoulders, dark sleeve + orange
  // cuff + armored mitt.
  function buildArm(side) {
    var arm = new THREE.Group();
    arm.position.set(0.66 * side, 1.02, 0);
    arm.rotation.z = -0.14 * side;                                                    // angled slightly outward
    mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.55, 10), matSuit, 0, -0.3, 0, arm);
    mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.1, 10), matJacket, 0, -0.48, 0, arm);
    mesh(new THREE.SphereGeometry(0.16, 12, 10), matArmor, 0, -0.62, 0, arm);
    cat.add(arm);
    return arm;
  }
  var armR = buildArm(1);
  var armL = buildArm(-1);

  // ---- Stubby legs with chunky boots + orange boot trim.
  function buildLeg(side) {
    var leg = new THREE.Group();
    leg.position.set(0.3 * side, 0.14, 0);
    mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.42, 10), matSuit, 0, -0.22, 0, leg);
    mesh(new THREE.BoxGeometry(0.36, 0.06, 0.52), matJacket, 0, -0.4, 0.06, leg);
    mesh(new THREE.BoxGeometry(0.34, 0.24, 0.5), matArmor, 0, -0.52, 0.06, leg);
    cat.add(leg);
    return leg;
  }
  buildLeg(1);
  buildLeg(-1);

  // ---- Curled cable tail behind: root stub + 3/4 torus curl with a
  // glowing orange tip. Whole group sways from its base pivot.
  var tail = new THREE.Group();
  tail.position.set(0, 0.35, -0.42);
  cat.add(tail);
  var tailRoot = mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.35, 8), matSuit, 0, -0.05, -0.12, tail);
  tailRoot.rotation.x = 1.15;
  var curl = mesh(new THREE.TorusGeometry(0.28, 0.055, 8, 24, Math.PI * 1.5), matSuit, 0, 0.18, -0.3, tail);
  curl.rotation.y = Math.PI / 2 - 0.35;                                               // curl reads from the front too
  var tipA = Math.PI * 1.5;
  mesh(new THREE.SphereGeometry(0.075, 10, 8), matGlowOr, Math.cos(tipA) * 0.28, Math.sin(tipA) * 0.28, 0, curl);

  // ============================================================
  // Normalize: same contract as the old GLB robot — fit the max
  // dimension to ~2.95, recenter on origin, sit slightly up.
  // ============================================================
  cat.traverse(function (o) {
    if (o.isMesh) o.frustumCulled = false;
  });
  var box = new THREE.Box3().setFromObject(cat);
  var size = box.getSize(new THREE.Vector3());
  var center = box.getCenter(new THREE.Vector3());
  var baseScale = 2.95 / Math.max(size.x, size.y, size.z);
  cat.scale.setScalar(baseScale);
  cat.position.sub(center.multiplyScalar(baseScale));
  var baseY = cat.position.y + 0.05;
  scene.add(cat);
  vyRoot.classList.add("vy-3d");

  // ============================================================
  // Interaction + animation state.
  // ============================================================
  var clock = new THREE.Clock();
  var target = { x: 0, y: 0 };
  var hover = 0;
  var hoverTarget = 0;
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  var launch = document.querySelector(".vy-launch");
  if (launch) {
    launch.addEventListener("mouseenter", function () { hoverTarget = 1; });
    launch.addEventListener("mouseleave", function () { hoverTarget = 0; });
  }

  window.addEventListener("pointermove", function (e) {
    var r = stage.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width / 2)) / Math.max(window.innerWidth, 1);
    var dy = (e.clientY - (r.top + r.height / 2)) / Math.max(window.innerHeight, 1);
    target.y = Math.max(-0.7, Math.min(0.7, dx * 2.2));
    target.x = Math.max(-0.32, Math.min(0.32, dy * 1.3));
  }, { passive: true });

  window.addEventListener("resize", function () {
    W = stage.clientWidth || W;
    H = stage.clientHeight || H;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });

  // Animation channel state — entrance, blink and ear-twitch timers.
  var t = 0;
  var intro = reduce ? 1 : 0;          // 0→1 entrance (scale-up + rise settle)
  var nextBlink = 2.6;                 // seconds until next quick eye "blink" dip
  var blinkT = -1;                     // >=0 while a blink is in flight
  var BLINK_DUR = 0.16;
  var nextTwitch = 4.5;                // seconds until next ear twitch
  var twitchT = -1;                    // counts down while a twitch is in flight
  var TWITCH_DUR = 0.4;
  var twitchEar = earL;

  function easeOutBack(p) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  }

  (function loop() {
    requestAnimationFrame(loop);
    var dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    hover += (hoverTarget - hover) * 0.12;

    // ---- Entrance: quick pop-in with a soft overshoot, then settle.
    if (intro < 1) intro = Math.min(intro + dt / 0.65, 1);
    var pop = easeOutBack(intro);
    var settle = 1 - intro;

    // ---- Idle breathing: gentle bob + micro torso scale.
    var bob = reduce ? 0 : Math.sin(t * 1.7) * 0.06;
    if (!reduce) torso.scale.y = 1 + Math.sin(t * 2.1) * 0.012;
    cat.scale.setScalar(baseScale * (0.6 + 0.4 * pop));
    cat.position.y = baseY + bob + hover * 0.12 - settle * 0.35;

    if (reduce) {
      // Static pose: no tilt/sway/bob; eyes hold a steady glow.
      cat.rotation.set(0, 0, 0);
      head.rotation.set(0, 0, 0);
      matEye.emissiveIntensity = 1.6 + hover * 0.6;
      eyeLight.intensity = 0.9 + hover * 0.5;
    } else {
      // ---- Cursor-follow: head leads, body lags a touch behind.
      cat.rotation.y += (target.y * 0.45 - cat.rotation.y) * 0.07;
      cat.rotation.x += (target.x * 0.35 - cat.rotation.x) * 0.07;
      head.rotation.y += (target.y * 0.55 - head.rotation.y) * 0.11;
      head.rotation.x += (target.x * 0.6 - head.rotation.x) * 0.11;

      // ---- Eye glow: slow pulse + hover brighten + occasional blink dip.
      var glow = 1.5 + Math.sin(t * 2.4) * 0.25 + hover * 0.9;
      if (blinkT >= 0) {
        blinkT += dt;
        var k = Math.sin(Math.PI * Math.min(blinkT / BLINK_DUR, 1)); // 0→1→0 shutter
        glow *= 1 - k * 0.8;
        eyes[0].scale.y = eyes[1].scale.y = 1 - k * 0.85;
        if (blinkT >= BLINK_DUR) {
          blinkT = -1;
          eyes[0].scale.y = eyes[1].scale.y = 1;
          nextBlink = t + 2.4 + Math.random() * 3.6;
        }
      } else if (t >= nextBlink) {
        blinkT = 0;
      }
      matEye.emissiveIntensity = glow;
      eyeLight.intensity = 0.7 + glow * 0.25;

      // ---- Tail sway + idle arm micro-swing.
      tail.rotation.y = Math.sin(t * 1.3) * 0.28;
      tail.rotation.x = Math.sin(t * 0.9 + 1.2) * 0.08;
      armL.rotation.z = 0.14 + Math.sin(t * 1.7) * 0.03;
      armR.rotation.z = -0.14 - Math.sin(t * 1.7 + 0.6) * 0.03;

      // ---- Ears: hover perk (stand up + tip forward) + rare twitch.
      var perk = 1 - hover * 0.5;
      earL.rotation.z = 0.22 * perk;
      earR.rotation.z = -0.22 * perk;
      earL.rotation.x = earR.rotation.x = -0.12 * hover;
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
        twitchEar = Math.random() < 0.5 ? earL : earR;
      }
    }

    renderer.render(scene, camera);
  })();
})();

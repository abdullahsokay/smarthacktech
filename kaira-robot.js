/* ============================================================
   KAIRA — 3D animated robot launcher (Three.js, classic build)
   Uses the global THREE (loaded as a UMD script by veyra.js) — no
   ES modules / import maps, so it loads reliably across browsers.
   Idle animation + soft float + cursor-follow. Click opens chat.
   If WebGL or the model fails, the CSS fallback orb stays.
   ============================================================ */
(function () {
  "use strict";
  var THREE = window.THREE;
  var stage = document.getElementById("kaira-stage");
  var vyRoot = document.querySelector(".vy");
  if (!THREE || !THREE.GLTFLoader || !stage || !vyRoot) return;

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

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223047, 1.15));
  var key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(3, 6, 5);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0x7c5cff, 1.5);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  var robot = null;
  var mixer = null;
  var clock = new THREE.Clock();
  var target = { x: 0, y: 0 };
  var hover = 0;
  var hoverTarget = 0;
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  new THREE.GLTFLoader().load(
    "/models/kaira.glb",
    function (gltf) {
      robot = gltf.scene;
      robot.traverse(function (o) {
        if (o.isMesh) o.frustumCulled = false;
      });
      var box = new THREE.Box3().setFromObject(robot);
      var size = box.getSize(new THREE.Vector3());
      var center = box.getCenter(new THREE.Vector3());
      var s = 2.95 / Math.max(size.x, size.y, size.z);
      robot.scale.setScalar(s);
      robot.position.sub(center.multiplyScalar(s));
      robot.position.y += 0.05;
      scene.add(robot);
      vyRoot.classList.add("vy-3d");

      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(robot);
        var byName = {};
        gltf.animations.forEach(function (c) { byName[c.name] = c; });
        var idle = byName["Idle"] || byName["Dance"] || gltf.animations[0];
        if (idle) mixer.clipAction(idle).play();
      }
    },
    undefined,
    function () {
      /* model failed — CSS fallback orb remains */
    }
  );

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

  var t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    var dt = Math.min(clock.getDelta(), 0.05);
    t += dt;
    if (mixer) mixer.update(dt);
    hover += (hoverTarget - hover) * 0.12;
    if (robot) {
      robot.position.y = 0.05 + (reduce ? 0 : Math.sin(t * 1.7) * 0.07) + hover * 0.12;
      robot.rotation.y += (target.y - robot.rotation.y) * 0.08;
      robot.rotation.x += (target.x - robot.rotation.x) * 0.08;
    }
    renderer.render(scene, camera);
  })();
})();

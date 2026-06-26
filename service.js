/* ============================================================
   HackTech — service detail renderer
   One template (service.html) → many services via ?s=KEY.
   OWNER: edit/add services in the SERVICES map below.
   ============================================================ */
(function () {
  "use strict";

  var SERVICES = {
    software: {
      eyebrow: "Service · Software Development",
      title: 'Software that <span class="accent">fits how you work</span>',
      lead: "From idea to launch — scalable web, mobile and enterprise software, built with clean code and long-term support.",
      img: "images/software.jpg", tag: "Web · Mobile · SaaS",
      chips: ["Web Applications", "Mobile Apps", "SaaS Platforms", "Enterprise Software", "APIs & Integrations", "AI Features"],
      features: [
        ["Custom web apps", "Dashboards, portals and platforms tailored to your exact workflow."],
        ["Mobile apps", "Android & iOS apps your customers and team actually enjoy using."],
        ["SaaS & cloud", "Multi-tenant products with billing, auth and scale built in."],
        ["Enterprise systems", "ERPs, CRMs and integrations that connect your operations."],
        ["AI features", "Search, chat, recommendations and automation inside your product."],
        ["Support & SLAs", "Monitoring, maintenance and updates long after launch."]
      ],
      ctaP: "Tell us what you're building — we'll scope it and send a clear proposal."
    },
    ai: {
      eyebrow: "Service · AI & Automation",
      title: 'Put <span class="accent">AI to work</span>',
      lead: "Chatbots, autonomous agents, computer vision and workflow automation that remove busywork and save real hours every week.",
      img: "images/ai.jpg", tag: "Agents · Vision · Workflows",
      chips: ["AI Chatbots", "AI Agents", "Computer Vision", "Process Automation", "Knowledge / RAG", "Integrations"],
      features: [
        ["AI chatbots", "Support and sales assistants trained on your own content."],
        ["Autonomous agents", "Tools that take real actions across your systems, not just chat."],
        ["Computer vision", "Detection, counting, OCR and quality checks from camera feeds."],
        ["Workflow automation", "Cut manual steps in operations, finance and back-office."],
        ["Custom models", "Fine-tuned and on-device models for your data and budget."],
        ["Safe integration", "Wired into your apps with guardrails and human review."]
      ],
      ctaP: "Bring a process you'd love to automate — we'll show you what's possible."
    },
    iot: {
      eyebrow: "Service · IoT Solutions",
      title: 'Bring everything <span class="accent">online, in real time</span>',
      lead: "Locally-engineered devices and live dashboards that connect vehicles, fuel, machines and assets — including our SOTMS fleet flagship.",
      img: "images/circuit.jpg", tag: "Devices · Live data",
      chips: ["Fleet Monitoring", "Fuel Monitoring", "Smart Sensors", "Industrial IoT", "Asset Tracking", "Custom IoT"],
      features: [
        ["Made-in-PK devices", "SentinelEdge boards and firmware engineered end-to-end at home."],
        ["Live dashboards", "See position, health and alerts the moment they happen."],
        ["SOTMS fleet platform", "Our flagship fleet-intelligence system — tracking, AI & savings."],
        ["Industrial IoT", "Bring machines, energy and processes online on the factory floor."],
        ["Asset tracking", "Know where your assets are and how they're being used."],
        ["Custom builds", "Have an idea? We design the device, firmware and app together."]
      ],
      ctaP: "From one sensor to a nationwide fleet — tell us what you want to connect.",
      ghost: { href: "demo.html", label: "Open Live Demo →" }
    },
    security: {
      eyebrow: "Service · Security & Surveillance",
      title: 'Protect <span class="accent">what matters</span>',
      lead: "Cameras, access control and biometrics — professionally surveyed, installed, configured and monitored end to end.",
      img: "images/security.jpg", tag: "CCTV · Access · Biometrics",
      chips: ["CCTV Installation", "IP Cameras", "Access Control", "Biometric Systems", "24/7 Monitoring", "Maintenance"],
      features: [
        ["Site survey", "We map your premises and design the right coverage — no blind spots."],
        ["HD / IP cameras", "Day-night, weatherproof cameras with clean remote viewing."],
        ["Access control", "Card, PIN and biometric entry for doors, gates and zones."],
        ["Biometrics", "Fingerprint and face attendance and access, integrated with HR."],
        ["Remote monitoring", "Watch live and get alerts on your phone, anywhere."],
        ["Service & support", "Installation, configuration and ongoing maintenance by us."]
      ],
      ctaP: "Book a free survey — we'll recommend exactly what your site needs."
    },
    smarthome: {
      eyebrow: "Service · Smart Home & Automation",
      title: 'Your whole space, <span class="accent">one tap away</span>',
      lead: "Lighting, locks, doorbells, cameras and energy — all from a single app or your voice, at home or the office.",
      img: "images/smart-home.jpg", tag: "One app · One voice",
      chips: ["Smart Lighting", "Smart Locks", "Doorbells & Cameras", "Energy Management", "Voice Control", "Office Automation"],
      features: [
        ["Smart lighting", "Scenes, schedules and dimming for every room and mood."],
        ["Smart locks & entry", "Keyless doors, video doorbells and guest access."],
        ["Cameras & alerts", "See your home or office and get notified instantly."],
        ["Energy management", "Track and cut power use with smart switches and meters."],
        ["Voice & app control", "Works with the assistants and the single app you already use."],
        ["Office automation", "Meeting rooms, access and energy — automated for work too."]
      ],
      ctaP: "Tell us about your space — we'll design an automation plan that just works."
    },
    training: {
      eyebrow: "Service · Training & Education",
      title: 'Turn learners into <span class="accent">builders</span>',
      lead: "Hands-on, project-based training and workshops that turn students and teams into real builders — taught by working engineers.",
      img: "images/training.jpg", tag: "Hands-on · Project-based",
      chips: ["AI Training", "Web Development", "Mobile Development", "IoT Training", "Workshops", "Corporate Cohorts"],
      features: [
        ["AI & data", "Practical AI, prompting and automation for students and teams."],
        ["Web development", "From fundamentals to shipping real, deployed projects."],
        ["Mobile development", "Build and publish real Android & iOS apps."],
        ["IoT & hardware", "Sensors, microcontrollers and real connected projects."],
        ["Workshops", "Short, intensive sessions for schools, universities and offices."],
        ["Corporate upskilling", "Custom cohorts to level-up your existing team."]
      ],
      ctaP: "Join a cohort or book a workshop — let's build skills that stick."
    },
    sotms: {
      eyebrow: "Flagship · SOTMS",
      title: 'SOTMS — <span class="accent">smart fleet, one screen</span>',
      lead: "Locally-made SentinelEdge devices and the FleetPulse dashboard turn thousands of vehicle signals into one calm, real-time command centre.",
      img: "images/fleet.jpg", tag: "Live fleet intelligence",
      chips: ["Live Tracking", "DriveGuard AI", "EcoRoute Savings", "GuardianOBD", "Geo-fencing", "Reports"],
      features: [
        ["Live tracking", "Every vehicle's position, speed and status, second by second."],
        ["DriveGuard AI", "On-device alerts for fatigue, harsh braking and distraction."],
        ["EcoRoute savings", "Fuel and route optimisation that cuts cost month after month."],
        ["GuardianOBD", "Engine health and diagnostics before small issues become big ones."],
        ["Geo-fencing", "Zones, alerts and trip rules tailored to your operation."],
        ["One dashboard", "Tracking, safety, fuel and diagnostics — one login, one truth."]
      ],
      ctaP: "See it on sample data, then book a walkthrough on your real vehicles.",
      ghost: { href: "demo.html", label: "Open Live Demo →" }
    }
  };

  function esc(s) { return String(s).replace(/[<>&]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]; }); }
  var key = (new URLSearchParams(location.search).get("s") || "").toLowerCase();
  var svc = SERVICES[key];
  if (!svc) { location.replace("solutions.html"); return; }

  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function plainTitle() { return svc.title.replace(/<[^>]+>/g, ""); }

  document.title = plainTitle() + " — HackTech";
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", svc.lead);

  set("svc-eyebrow", esc(svc.eyebrow));
  set("svc-title", svc.title);
  set("svc-lead", esc(svc.lead));
  set("svc-chips", svc.chips.map(function (c) { return '<span class="chip">' + esc(c) + "</span>"; }).join(""));
  set("svc-tag", esc(svc.tag || ""));
  var img = document.getElementById("svc-img");
  if (img) { img.src = svc.img; img.alt = plainTitle(); }

  var check = '<div class="card__icon" aria-hidden="true"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>';
  set("svc-features", svc.features.map(function (f, i) {
    return '<article class="card card--glow tilt reveal" style="transition-delay:' + (i % 3 * 0.06).toFixed(2) + 's">' +
      check + '<h3 class="card__title">' + esc(f[0]) + "</h3>" +
      '<p class="card__text">' + esc(f[1]) + "</p></article>";
  }).join(""));

  var ctaLabel = (svc.eyebrow.split("·").pop() || "your project").trim();
  set("svc-cta-h", "Ready for " + esc(ctaLabel) + "?");
  set("svc-cta-p", esc(svc.ctaP || "Tell us your goal and we'll put the right team on it."));

  // optional secondary hero button (e.g. live demo for IoT/SOTMS)
  if (svc.ghost) {
    var g = document.getElementById("svc-cta-ghost");
    if (g) { g.href = svc.ghost.href; g.textContent = svc.ghost.label; }
  }

  // re-run reveal/sheen on the freshly injected cards
  document.querySelectorAll("#svc-features .reveal").forEach(function (el) { el.classList.add("show"); });
})();

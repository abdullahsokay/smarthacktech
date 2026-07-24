/* ============================================================
   HackTech, service detail renderer
   One template (service.html) → many services via ?s=KEY.
   OWNER: edit/add services in the SERVICES map below.

   Every service page follows the same family structure:
     hero → overview → demo (optional) → capabilities →
     technologies → process → related projects → CTA
   Sections with no data stay hidden, so a service can opt out
   of any block without breaking the page.
   ============================================================ */
(function () {
  "use strict";

  /* Real, shipped projects only — these mirror /portfolio. Never add a
     project here that does not exist on the portfolio page. */
  var WORK = {
    sotmsWeb: { img: "images/sotms-web.svg", tag: "Web App · Fleet", title: "SOTMS: Smart Transport Management",
      text: "Our flagship fleet command centre: live GPS tracking, vehicle diagnostics and fuel & driver analytics in one dashboard." },
    sotmsApp: { img: "images/sotms-app.svg", tag: "Mobile App", title: "SOTMS App: Fleet in Your Pocket",
      text: "The mobile companion to SOTMS: track every vehicle live, get speed, fuel and engine alerts, and review trips anywhere." },
    bidpilot: { img: "images/bidpilot.svg", tag: "AI System", title: "BidPilot AI: Smart Bidding",
      text: "An AI system that reads tenders, suggests winning bid amounts and scores win-probability on every proposal." },
    driver: { img: "images/driver-monitor.svg", tag: "Computer Vision", title: "Driver Monitoring System",
      text: "Computer vision that detects driver fatigue, distraction, phone use and seatbelt compliance in real time." },
    packride: { img: "images/packride.svg", tag: "Mobile App", title: "PackRide: Ride-Hailing",
      text: "A ride-hailing app for local riders: book in seconds, track your driver live and see upfront, fair fares." },
    roadmate: { img: "images/roadmate.svg", tag: "Mobile App", title: "RoadMate: Roadside Assistance",
      text: "On-demand roadside help connecting stranded drivers with nearby mechanics, with live tracking and in-app chat." },
    dubai: { img: "images/mydubaisafari.webp", tag: "Web Platform", title: "MyDubaiSafari: Desert Adventures",
      text: "A booking platform for Dubai desert safaris, deployed and taking real enquiries via WhatsApp." }
  };

  var SERVICES = {
    software: {
      eyebrow: "Service · Software Development",
      title: 'Software built <span class="accent">around your business</span>',
      lead: "Whether you're launching a startup, digitising operations or scaling an enterprise, HackTech develops secure, scalable software tailored to your business goals.",
      img: "images/software.webp", tag: "Web · Mobile · SaaS",
      chips: ["Business Websites", "Enterprise Platforms", "SaaS Applications", "Mobile Apps", "Admin Dashboards", "APIs & Backend", "Cloud Integrations"],
      overviewEyebrow: "The challenge",
      overviewTitle: 'Most software fails because it was <span class="accent">never built for the business</span>',
      overview: "Off-the-shelf tools force your team to work the way the software wants, and generic templates break the moment your process differs. The result is workarounds, spreadsheets and lost hours.",
      overview2: "We build software that solves real operational challenges instead. Every application is engineered for performance, reliability and long-term growth, designed around the way your team actually works.",
      featEyebrow: "Capabilities",
      featTitle: 'What we <span class="accent">build</span>',
      featLead: "From a single landing page to a full enterprise platform.",
      features: [
        ["Business websites", "Fast, polished sites that turn visitors into real enquiries."],
        ["Enterprise platforms", "Internal systems that run your operations end to end."],
        ["SaaS applications", "Multi-tenant products with billing, auth and scale built in."],
        ["Mobile applications", "Android and iOS apps your customers and team enjoy using."],
        ["Admin dashboards", "Clear control panels for the people who actually run the business."],
        ["APIs, backend & cloud", "Reliable services and integrations behind every product."]
      ],
      techTitle: 'Built with <span class="accent">proven technology</span>',
      techGroups: [
        { label: "Technologies", items: ["React", "Next.js", "Flutter", "FastAPI", "Node.js", "Supabase", "Firebase", "PostgreSQL", "Docker"] }
      ],
      process: [
        ["Discover", "We map your workflow, goals and constraints before a line is written."],
        ["Design", "Architecture, data model and interface, agreed with you up front."],
        ["Develop", "Built in visible increments so you see progress, not just a deadline."],
        ["Deploy & support", "Launch, monitoring and ongoing improvement long after go-live."]
      ],
      projects: ["roadmate", "packride", "dubai"],
      ctaLabel: "Let's Build Your Software",
      ctaP: "Tell us what you're building and we'll scope it, then send a clear proposal."
    },

    ai: {
      eyebrow: "Service · AI & Automation",
      title: 'Turning artificial intelligence <span class="accent">into business value</span>',
      lead: "Artificial intelligence should do more than impress, it should solve problems. HackTech develops AI systems that automate processes, analyse data and measurably improve efficiency.",
      img: "images/ai.webp", tag: "Agents · Vision · Workflows",
      chips: ["AI Assistants", "Chatbots", "Computer Vision", "OCR", "Predictive Analytics", "AI Agents", "Workflow Automation"],
      overviewEyebrow: "The challenge",
      overviewTitle: 'Businesses generate more data than ever, and <span class="accent">most of it goes unused</span>',
      overview: "Reports pile up, documents get retyped, and the same manual checks repeat every single day. The information needed to make a better decision is usually already there, just buried.",
      overview2: "HackTech turns that data into intelligent systems that automate the repetitive work, improve accuracy and create measurable business value, wired into your existing tools with guardrails and human review.",
      featEyebrow: "Capabilities",
      featTitle: 'AI <span class="accent">solutions</span> we deliver',
      featLead: "Practical systems that pay for themselves in hours saved.",
      features: [
        ["AI assistants & chatbots", "Support and sales assistants trained on your own content."],
        ["Intelligent agents", "Tools that take real actions across your systems, not just chat."],
        ["Computer vision", "Detection, counting, quality checks and safety monitoring from camera feeds."],
        ["OCR & documents", "Turn invoices, forms and paperwork into structured, searchable data."],
        ["Predictive analytics", "Forecast demand, risk and maintenance before problems arrive."],
        ["Workflow automation", "Cut manual steps across operations, finance and back-office."]
      ],
      techTitle: 'The <span class="accent">stack and the sectors</span> we work in',
      techGroups: [
        { label: "Technologies", items: ["OpenAI", "Gemini", "YOLO", "TensorFlow", "OpenCV", "Python", "LangChain", "FastAPI"] },
        { label: "Industries", items: ["Healthcare", "Transportation", "Education", "Manufacturing", "Retail", "Finance"] }
      ],
      process: [
        ["Discover", "We find the process where AI actually saves time, not the flashiest one."],
        ["Data & design", "Assess your data, choose the approach and define what success means."],
        ["Build & train", "Develop, train and evaluate against real examples from your business."],
        ["Deploy & improve", "Ship with human review, then keep tuning as real usage comes in."]
      ],
      projects: ["bidpilot", "driver"],
      ctaLabel: "Build an AI Solution",
      ctaP: "Bring us a process you'd love to automate and we'll show you what's possible."
    },

    iot: {
      eyebrow: "Service · IoT Solutions",
      title: 'Connecting devices. <span class="accent">Delivering intelligence.</span>',
      lead: "HackTech engineers IoT ecosystems that combine sensors, embedded hardware and cloud software to give you real-time visibility and automation over everything that moves.",
      img: "images/circuit.webp", tag: "Devices · Live data",
      chips: ["Fleet Monitoring", "Industrial Automation", "Asset Tracking", "Agriculture", "Environmental Monitoring", "Smart Infrastructure"],
      overviewEyebrow: "The challenge",
      overviewTitle: 'You cannot improve <span class="accent">what you cannot see</span>',
      overview: "Vehicles, machines and assets spend most of their life outside your line of sight. Problems surface as costs at the end of the month, long after the moment they could have been prevented.",
      overview2: "We put those assets online. Locally-engineered devices stream live data to dashboards you can act on, so maintenance, fuel and downtime become things you manage rather than discover.",
      featEyebrow: "Capabilities",
      featTitle: 'Where our IoT <span class="accent">goes to work</span>',
      featLead: "Engineered in Pakistan, for Pakistani conditions.",
      features: [
        ["Fleet monitoring", "Live position, speed, fuel and driver behaviour across the whole fleet."],
        ["Industrial automation", "Bring machines, energy and processes online on the factory floor."],
        ["Asset tracking", "Know where every asset is and how it is actually being used."],
        ["Agriculture", "Soil, water and climate sensing that turns guesswork into scheduling."],
        ["Environmental monitoring", "Temperature, air quality and conditions logged continuously."],
        ["Custom embedded systems", "Have an idea? We design the board, firmware and app together."]
      ],
      techTitle: 'The <span class="accent">hardware and the payoff</span>',
      techGroups: [
        { label: "Hardware", items: ["ESP32", "Arduino", "Raspberry Pi", "GPS", "Sensors", "Edge AI", "Cloud Dashboards"] },
        { label: "Why IoT", items: ["Real-Time Monitoring", "Remote Control", "Predictive Maintenance", "Operational Efficiency", "Reduced Costs"] }
      ],
      process: [
        ["Discover", "What do you need to see, and what decision will that data drive?"],
        ["Hardware & architecture", "Select sensors and boards, design the device and the data path."],
        ["Build & integrate", "Firmware, cloud and dashboard built and tested as one system."],
        ["Deploy & support", "Fitting, calibration, training and ongoing maintenance."]
      ],
      projects: ["sotmsWeb", "sotmsApp"],
      ctaLabel: "Start an IoT Project",
      ctaP: "From one sensor to a nationwide fleet, tell us what you want to connect."
    },

    smarthome: {
      eyebrow: "Service · Smart Home & Automation",
      title: 'Intelligent living <span class="accent">begins here</span>',
      lead: "Experience a home that responds to you automatically. From lighting and security to energy management and voice control, our automation makes everyday living simpler, safer and more efficient.",
      img: "images/smart-home.webp", tag: "One app · One voice",
      chips: ["Smart Lighting", "Smart Locks", "Security Cameras", "Video Doorbells", "Energy Monitoring", "Voice Control", "Remote Access"],
      overviewEyebrow: "Your space",
      overviewTitle: 'Smarter. <span class="accent">Safer. Simpler.</span>',
      overview: "Imagine walking into a home that already knows what you need. The lights adjust themselves. Your doors lock behind you. The temperature is exactly how you like it, and your security system quietly protects your family around the clock.",
      overview2: "Everything works together from one mobile app, or simply through your voice. At HackTech we design intelligent homes that combine comfort, security and energy efficiency into one seamless experience.",
      featEyebrow: "Capabilities",
      featTitle: 'What we <span class="accent">install and automate</span>',
      featLead: "Designed for your space, whether that is a home or an office floor.",
      features: [
        ["Smart lighting", "Scenes, schedules and dimming for every room and every mood."],
        ["Smart locks & entry", "Keyless doors, video doorbells and guest access you control remotely."],
        ["Cameras & alerts", "See your home or office live and get notified the moment it matters."],
        ["Climate automation", "Heating and cooling that adjusts to the room and the hour."],
        ["Energy monitoring", "Track and trim power use with smart switches and meters."],
        ["Voice & app control", "Works with the assistants and the single app you already use."]
      ],
      techTitle: 'What it <span class="accent">actually gives you</span>',
      techGroups: [
        { label: "Benefits", items: ["Comfort", "Security", "Energy Savings", "Convenience", "Complete Control"] }
      ],
      process: [
        ["Site visit", "We walk your space and understand how you actually live or work in it."],
        ["Design", "A room-by-room automation plan, with devices and budget agreed up front."],
        ["Install & configure", "Clean installation, scenes built, everything tested end to end."],
        ["Handover & support", "We train you on the app, then stay available when you need us."]
      ],
      demo: {
        video: "images/smarthomevideo.mp4",
        poster: "images/smarthome-poster.webp",
        eyebrow: "The experience",
        title: 'One home, <span class="accent">perfectly in sync</span>',
        lead: "Watch a HackTech smart home respond as a single system, lighting, entry, cameras and energy working together from one app or a spoken word.",
        points: [
          "Smart lighting", "Smart locks", "Video doorbells",
          "CCTV integration", "Smart curtains", "Climate control",
          "Energy monitoring", "Voice assistants", "Remote mobile access"
        ]
      },
      ctaLabel: "Book a Smart Home Consultation",
      ctaP: "Tell us about your space and we'll design an automation plan that just works."
    },

    security: {
      eyebrow: "Service · Security & Surveillance",
      title: 'Protect <span class="accent">what matters most</span>',
      lead: "HackTech designs intelligent security systems that combine surveillance, access control and monitoring to safeguard businesses, offices and residential spaces.",
      img: "images/security.webp", tag: "CCTV · Access · Biometrics",
      chips: ["CCTV", "IP Cameras", "Biometric Attendance", "Access Control", "Remote Monitoring", "Video Analytics", "Security Consultation"],
      overviewEyebrow: "The challenge",
      overviewTitle: 'Cameras alone <span class="accent">are not security</span>',
      overview: "Most sites have footage nobody watches, blind spots nobody mapped, and a recorder that quietly stopped working months ago. Evidence only matters if the system was working on the day you needed it.",
      overview2: "We design coverage from a real site survey, install enterprise-grade equipment properly, and keep it monitored and maintained, so the system protects you every day and not just on the day it was installed.",
      featEyebrow: "Capabilities",
      featTitle: 'Security <span class="accent">services</span>',
      featLead: "Surveyed, installed, configured and monitored end to end.",
      features: [
        ["CCTV & IP cameras", "Day-night, weatherproof coverage with clean remote viewing."],
        ["Access control", "Card, PIN and biometric entry for doors, gates and restricted zones."],
        ["Biometric attendance", "Fingerprint and face attendance that integrates with your HR records."],
        ["Video analytics", "Motion, intrusion and object alerts instead of hours of footage."],
        ["Remote monitoring", "Watch live and receive alerts on your phone, from anywhere."],
        ["Security consultation", "A site survey and honest recommendation before you spend."]
      ],
      techTitle: 'Why teams <span class="accent">choose HackTech</span>',
      techGroups: [
        { label: "Why HackTech", items: ["Professional Installation", "Enterprise-Grade Equipment", "Remote Access", "24/7 Monitoring", "Local Support"] }
      ],
      process: [
        ["Site survey", "We map your premises and find the blind spots before quoting."],
        ["System design", "Camera positions, storage and access rules designed for your site."],
        ["Install & configure", "Professional installation, clean cabling, everything tested."],
        ["Monitor & maintain", "Ongoing monitoring, health checks and fast local support."]
      ],
      projects: ["driver", "sotmsWeb"],
      ctaLabel: "Secure Your Property",
      ctaP: "Book a free survey and we'll recommend exactly what your site needs."
    },

    training: {
      eyebrow: "Service · Training & Education",
      title: 'Learn from engineers <span class="accent">building real technology</span>',
      lead: "Gain practical skills through industry-focused training designed around real projects, modern tools and hands-on learning, taught by engineers who ship commercial products.",
      img: "images/training.webp", tag: "Hands-on · Project-based",
      chips: ["Artificial Intelligence", "Web Development", "Mobile Development", "IoT", "Embedded Systems", "Computer Vision", "Cloud Technologies"],
      overviewEyebrow: "The challenge",
      overviewTitle: 'Certificates are easy. <span class="accent">Shipping is not.</span>',
      overview: "Plenty of courses teach syntax and hand out a certificate. Very few put you through the messy part: building something real, fixing it when it breaks, and getting it in front of actual users.",
      overview2: "Our programmes are built the other way round. You work on real projects with modern tools, mentored by engineers who do this commercially every day, and you finish with a portfolio rather than a PDF.",
      featEyebrow: "Programmes",
      featTitle: 'What you can <span class="accent">learn with us</span>',
      featLead: "For students, teams and organisations.",
      features: [
        ["Artificial intelligence", "Practical AI, prompting and automation you can apply immediately."],
        ["Web development", "From fundamentals to shipping real, deployed applications."],
        ["Mobile development", "Build and publish real Android and iOS apps."],
        ["IoT & embedded systems", "Sensors, microcontrollers and genuinely connected projects."],
        ["Computer vision", "Detection and recognition built on real image data."],
        ["Cloud technologies", "Deploy, host and scale the things you build."]
      ],
      techTitle: 'How we <span class="accent">teach</span>',
      techGroups: [
        { label: "Learning approach", items: ["Project-Based", "Industry Mentors", "Hands-On Labs", "Portfolio Projects", "Career Guidance"] }
      ],
      process: [
        ["Assess", "We find your current level and what you actually want to build."],
        ["Plan", "A curriculum and project track matched to that goal."],
        ["Teach & build", "Hands-on sessions where you ship working software each week."],
        ["Certify & guide", "Portfolio review, certification and career guidance at the end."]
      ],
      ctaLabel: "Join Our Training Programs",
      ctaP: "Join a cohort or book a workshop, let's build skills that stick."
    },

    sotms: {
      eyebrow: "Flagship · SOTMS",
      title: 'SOTMS, <span class="accent">smart fleet, one screen</span>',
      lead: "Locally-built tracking devices and the SOTMS dashboard turn thousands of vehicle signals into one calm, real-time command centre.",
      img: "images/fleet.webp", tag: "Live fleet intelligence",
      chips: ["Live Tracking", "Driver-behavior AI", "Fuel & Route Savings", "Vehicle Diagnostics", "Geo-fencing", "Reports"],
      overviewEyebrow: "The challenge",
      overviewTitle: 'A fleet you cannot see <span class="accent">is a fleet you cannot control</span>',
      overview: "Fuel disappears, routes drift, and unsafe driving only becomes visible after an incident or an invoice. Most operators are reacting to last month's data.",
      overview2: "SOTMS puts every vehicle on one live screen, combining our own tracking hardware with dashcam AI and analytics, so cost and safety become things you manage in real time.",
      featEyebrow: "Capabilities",
      featTitle: 'One platform for <span class="accent">tracking, safety & savings</span>',
      featLead: "Engineered in Pakistan, for Pakistani roads.",
      features: [
        ["Live tracking", "Every vehicle's position, speed and status, second by second."],
        ["Driver-behavior AI", "On-device alerts for fatigue, harsh braking and distraction."],
        ["Fuel & route savings", "Fuel and route optimisation that cuts cost month after month."],
        ["Vehicle diagnostics", "Engine health flagged before small issues become breakdowns."],
        ["Geo-fencing", "Zones, alerts and trip rules tailored to your operation."],
        ["One dashboard", "Tracking, safety, fuel and diagnostics in one login."]
      ],
      techTitle: 'What operators <span class="accent">get out of it</span>',
      techGroups: [
        { label: "Outcomes", items: ["Lower Fuel Cost", "Safer Drivers", "Less Downtime", "Full Visibility", "Faster Response"] }
      ],
      process: [
        ["Discover", "We look at your fleet, routes and where the money is leaking."],
        ["Fit devices", "Our locally-built trackers installed across your vehicles."],
        ["Configure & train", "Zones, alerts and reports set up, your team trained on the dashboard."],
        ["Support & optimise", "Ongoing support, plus tuning as your operation changes."]
      ],
      projects: ["sotmsWeb", "sotmsApp"],
      ctaLabel: "Explore SOTMS",
      ctaP: "See it on sample data, then book a walkthrough on your real vehicles."
    }
  };

  function esc(s) { return String(s).replace(/[<>&]/g, function (c) { return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]; }); }
  var key = (new URLSearchParams(location.search).get("s") || "").toLowerCase();
  var svc = SERVICES[key];
  if (!svc) { location.replace("/solutions"); return; }

  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function show(id) { var el = document.getElementById(id); if (el) el.hidden = false; }
  function plainTitle() { return svc.title.replace(/<[^>]+>/g, ""); }

  document.title = plainTitle() + ", HackTech";
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", svc.lead);

  // per-service SEO: canonical + Open Graph / Twitter, injected since the
  // page is data-driven (the static head can't know which service loaded).
  (function () {
    var head = document.head, title = plainTitle() + ", HackTech";
    var canonical = "https://www.hacktechzone.com/service?s=" + encodeURIComponent(key);
    function meta(attr, name, content) {
      var el = document.querySelector("meta[" + attr + '="' + name + '"]');
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); head.appendChild(el); }
      el.setAttribute("content", content);
    }
    var link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; head.appendChild(link); }
    link.href = canonical;
    meta("property", "og:type", "website");
    meta("property", "og:title", title);
    meta("property", "og:description", svc.lead);
    meta("property", "og:url", canonical);
    meta("property", "og:image", "https://www.hacktechzone.com/og-image.png");
    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", svc.lead);
  })();

  /* ---------- hero ---------- */
  set("svc-eyebrow", esc(svc.eyebrow));
  set("svc-title", svc.title);
  set("svc-lead", esc(svc.lead));
  set("svc-chips", svc.chips.map(function (c) { return '<span class="chip">' + esc(c) + "</span>"; }).join(""));
  set("svc-tag", esc(svc.tag || ""));
  var img = document.getElementById("svc-img");
  if (img) { img.src = svc.img; img.alt = plainTitle(); }

  /* ---------- overview: the story, before any feature cards ---------- */
  if (svc.overview) {
    set("svc-overview-eyebrow", esc(svc.overviewEyebrow || "Overview"));
    set("svc-overview-title", svc.overviewTitle || "");
    set("svc-overview", esc(svc.overview));
    set("svc-overview2", esc(svc.overview2 || ""));
    show("svc-overview-sec");
  }

  /* ---------- optional demo showcase (video + highlights) ---------- */
  if (svc.demo) {
    var d = svc.demo;
    set("svc-demo-eyebrow", esc(d.eyebrow || "See it in action"));
    set("svc-demo-title", d.title || "");
    set("svc-demo-lead", esc(d.lead || ""));
    set("svc-demo-points", (d.points || []).map(function (p) {
      return '<li><span class="ck">&check;</span>' + esc(p) + "</li>";
    }).join(""));
    var dv = document.getElementById("svc-demo-vid");
    if (dv) {
      if (d.poster) dv.poster = d.poster;
      dv.setAttribute("data-src", d.video);
      // enhance.js already ran, so attach the source + start playback here for
      // wide, motion-OK screens; phones keep the poster only (no download).
      var wide = window.matchMedia("(min-width:761px)").matches;
      var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
      if (wide && !reduce) {
        dv.src = d.video; dv.autoplay = true;
        var pr = dv.play(); if (pr && pr.catch) pr.catch(function () {});
      }
    }
    show("svc-demo-sec");
  }

  /* ---------- capabilities ---------- */
  var check = '<div class="card__icon" aria-hidden="true"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>';
  set("svc-feat-eyebrow", esc(svc.featEyebrow || "Capabilities"));
  if (svc.featTitle) set("svc-feat-title", svc.featTitle);
  if (svc.featLead) set("svc-feat-lead", esc(svc.featLead));
  set("svc-features", svc.features.map(function (f, i) {
    return '<article class="card card--glow tilt reveal" style="transition-delay:' + (i % 3 * 0.06).toFixed(2) + 's">' +
      check + '<h3 class="card__title">' + esc(f[0]) + "</h3>" +
      '<p class="card__text">' + esc(f[1]) + "</p></article>";
  }).join(""));

  /* ---------- technologies / supporting lists ---------- */
  if (svc.techGroups && svc.techGroups.length) {
    if (svc.techTitle) set("svc-tech-title", svc.techTitle);
    // A single list needs no label — the section heading already names it.
    // Two lists get centred labels so they stay distinguishable.
    var multi = svc.techGroups.length > 1;
    set("svc-tech-groups", svc.techGroups.map(function (g) {
      return '<div class="tech-group">' +
        (multi ? '<span class="eyebrow center">' + esc(g.label) + "</span>" : "") +
        '<div class="tech-grid">' +
        g.items.map(function (t) { return '<span class="tech-item">' + esc(t) + "</span>"; }).join("") +
        "</div></div>";
    }).join(""));
    show("svc-tech-sec");
  }

  /* ---------- process ---------- */
  if (svc.process && svc.process.length) {
    set("svc-process", svc.process.map(function (p, i) {
      return '<article class="proc__step"><span class="proc__num">0' + (i + 1) + "</span>" +
        "<h3>" + esc(p[0]) + "</h3><p>" + esc(p[1]) + "</p></article>";
    }).join(""));
    show("svc-process-sec");
  }

  /* ---------- related projects (real, shipped work only) ---------- */
  if (svc.projects && svc.projects.length) {
    var cards = svc.projects.map(function (k, i) {
      var p = WORK[k];
      if (!p) return "";
      return '<article class="card card--glow reveal work-card" style="transition-delay:' + (i % 3 * 0.06).toFixed(2) + 's">' +
        '<div class="card__media"><img src="' + p.img + '" alt="' + esc(p.title) + '" loading="lazy">' +
        '<span class="work-tag">' + esc(p.tag) + "</span></div>" +
        '<h3 class="card__title">' + esc(p.title) + "</h3>" +
        '<p class="card__text">' + esc(p.text) + "</p></article>";
    }).join("");
    if (cards) { set("svc-projects", cards); show("svc-projects-sec"); }
  }

  /* ---------- CTAs ---------- */
  var ctaLabel = (svc.eyebrow.split("·").pop() || "your project").trim();
  set("svc-cta-h", "Ready for " + esc(ctaLabel) + "?");
  set("svc-cta-p", esc(svc.ctaP || "Tell us your goal and we'll put the right team on it."));

  // every quote CTA carries the service context so the contact form pre-selects it
  var ctxHref = "/contact?s=" + encodeURIComponent(key);
  ["svc-cta-primary", "svc-cta-ghost", "svc-cta-btn"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.href = ctxHref;
  });
  var ctaBtn = document.getElementById("svc-cta-btn");
  if (ctaBtn && svc.ctaLabel) ctaBtn.textContent = svc.ctaLabel;

  // re-run reveal on every freshly injected block (the observer already passed)
  document.querySelectorAll("#svc-features .reveal, #svc-projects .reveal").forEach(function (el) {
    el.classList.add("show");
  });
})();

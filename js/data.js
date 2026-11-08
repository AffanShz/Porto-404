/* ==========================================================================
   data.js — Tactical Project Archive & Dossiers.
   AffanShz Creative Portfolio.
   ========================================================================== */
window.PROJECTS = [
  {
    n: '001',
    title: 'DCC MOBILE',
    category: 'FLUTTER / BLOC / SUPABASE',
    year: '2026',
    status: 'ACTIVE',
    desc: 'Dinus Career Center — official UDINUS career app. Real-time job matching, application tracking, and background push sync on Supabase.',
    url: 'https://github.com/AffanShz/Dinus-Career-Center-Mobile',
    img: 'assets/work/dcc_v2.webp',
    tagline: 'CAREER INFRASTRUCTURE FOR 10K+ STUDENTS // REALTIME & OFFLINE-RESILIENT',
    role: 'LEAD MOBILE ENGINEER — SOLO',
    stack: ['FLUTTER', 'BLOC', 'SUPABASE', 'HIVE', 'AES-256'],
    problem: 'Students needed a single official channel for job matching, application tracking and career events — but campus connectivity is unreliable, so the app had to stay fully usable offline while still delivering realtime updates.',
    solution: 'Built a Flutter + BLoC client on Supabase with realtime channels for job matching and application state, backed by a local Hive cache encrypted with AES-256. Background push sync reconciles server and offline mutations when the device reconnects, so the UI never blocks on the network.',
    outcome: [
      'Offline-first sync with AES-256 encrypted local cache',
      'Realtime job matching on Supabase realtime channels',
      'Application lifecycle tracking without manual refresh',
      'Background push sync that heals offline mutations'
    ],
    gallery: [],
    links: [
      { label: 'SOURCE // GITHUB', href: 'https://github.com/AffanShz/Dinus-Career-Center-Mobile' }
    ]
  },
  {
    n: '002',
    title: 'AGRINOVA',
    category: 'AGRITECH / AI SUITE',
    year: '2026',
    status: 'DEPLOYED',
    desc: 'Offline-first agronomy platform for local farmers. Computer-vision disease diagnostics, adaptive AI assistant, and AES-256 encrypted Hive cache.',
    url: 'https://github.com/AffanShz/Agrinova',
    img: 'assets/work/petani_maju_v2.webp',
    tagline: 'AI AGRONOMY IN THE FIELD // DIAGNOSES CROPS WITHOUT A NETWORK',
    role: 'LEAD MOBILE & AI ENGINEER — SOLO',
    stack: ['FLUTTER', 'BLOC', 'TENSORFLOW LITE', 'HIVE', 'AES-256', 'REST'],
    problem: 'Smallholder farmers work in fields with little or no connectivity, yet they need on-the-spot crop disease diagnostics and agronomy guidance — AI features that normally demand a cloud round-trip.',
    solution: 'Architected an offline-first Flutter platform with on-device computer-vision inference for disease diagnostics and an adaptive AI assistant that runs locally. All field data persists in an AES-256 encrypted Hive cache and syncs upstream whenever a connection is available.',
    outcome: [
      'Fully on-device crop disease diagnostics — no cloud dependency',
      'Adaptive AI assistant that works offline in the field',
      'AES-256 encrypted Hive cache for sensitive farm data',
      'Deferred sync that survives zero-connectivity sessions'
    ],
    gallery: [],
    links: [
      { label: 'SOURCE // GITHUB', href: 'https://github.com/AffanShz/Agrinova' }
    ]
  },
  {
    n: '003',
    title: 'LOCAL-LLM',
    category: 'MOBILE AI / EDGE INFERENCE',
    year: '2025',
    status: 'LIVE',
    desc: 'On-device AI and local language model inference architecture for private, resilient mobile workflows without cloud dependency.',
    url: 'https://github.com/AffanShz/Local-LLM',
    img: 'assets/work/cover_local_llm.svg',
    tagline: 'PRIVATE INTELLIGENCE ON-DEVICE // ZERO CLOUD, ZERO LEAKS',
    role: 'MOBILE AI ENGINEER — SOLO',
    stack: ['FLUTTER', 'ON-DEVICE LLM', 'EDGE INFERENCE', 'DART FFI', 'HIVE'],
    problem: 'Mainstream AI assistants ship every keystroke to the cloud — unacceptable for private workflows and useless in offline conditions. Mobile hardware constraints make running a language model locally a non-trivial engineering problem.',
    solution: 'Designed a local language model inference architecture for mobile: quantized models executed directly on-device through a native inference bridge, with model lifecycle management and a lean memory footprint. The result is private, resilient AI that functions identically with or without a network.',
    outcome: [
      'Language model inference fully executed on-device',
      'Zero data egress — user prompts never leave the device',
      'Resilient workflows that hold with no network at all',
      'Model lifecycle management within mobile memory budgets'
    ],
    gallery: [],
    links: [
      { label: 'SOURCE // GITHUB', href: 'https://github.com/AffanShz/Local-LLM' }
    ]
  },
  {
    n: '004',
    title: 'MAHASISWA APP',
    category: 'DESKTOP / TAURI / RUST',
    year: '2025',
    status: 'PRODUCTION',
    desc: 'Lightweight, secure academic management desktop application leveraging Rust-backed Tauri and a modern TypeScript frontend.',
    url: 'https://github.com/AffanShz/mahasiswa-app-tauri',
    img: 'assets/work/cover_mahasiswa.svg',
    tagline: 'ACADEMIC OPS DESKTOP // RUST CORE, MINIMAL FOOTPRINT',
    role: 'DESKTOP ENGINEER — SOLO',
    stack: ['TAURI', 'RUST', 'TYPESCRIPT', 'SECURE LOCAL STORAGE'],
    problem: 'Academic management tools are typically Electron bloat — hundreds of megabytes of runtime for CRUD operations — and student records demand secure local handling that generic web wrappers do not provide.',
    solution: 'Built the desktop application on Tauri with a Rust-backed core and a modern TypeScript frontend, keeping the binary and memory footprint minimal while inheriting Rust memory-safety guarantees. Sensitive academic data is handled through Tauri secure local storage commands instead of exposed web contexts.',
    outcome: [
      'Rust-backed Tauri core with a minimal desktop footprint',
      'Secure local handling of academic records',
      'Type-safe TypeScript frontend over a memory-safe core',
      'Production-ready build for daily academic workflows'
    ],
    gallery: [],
    links: [
      { label: 'SOURCE // GITHUB', href: 'https://github.com/AffanShz/mahasiswa-app-tauri' }
    ]
  },
  {
    n: '005',
    title: 'AGRINOVA WEB',
    category: 'WEB / ASTRO SHOWCASE',
    year: '2024',
    status: 'DEPLOYED',
    desc: 'High-performance, content-focused landing page for smart agricultural technology, optimized for fast delivery with Astro.',
    url: 'https://github.com/AffanShz/AgriNova-Landing-page',
    img: 'assets/work/cover_agrinova_web.svg',
    tagline: 'SMART AGRI FRONT DOOR // STATIC-FIRST, SHIPS IN MILLISECONDS',
    role: 'FRONT-END ENGINEER — SOLO',
    stack: ['ASTRO', 'HTML', 'CSS', 'STATIC OUTPUT'],
    problem: 'The Agrinova platform needed a public landing surface that communicates smart-agriculture technology clearly and loads fast on the rural connections its audience actually uses — where heavy JS frameworks fail.',
    solution: 'Built a content-focused landing page on Astro with a static-first architecture: near-zero client JavaScript, content rendered ahead of time, and assets optimized for fast first delivery on slow networks.',
    outcome: [
      'Static-first architecture with near-zero client JS',
      'Fast first delivery on low-bandwidth rural connections',
      'Content-focused SEO surface for the Agrinova brand',
      'Deployed and maintained as the public entry point'
    ],
    gallery: [],
    links: [
      { label: 'SOURCE // GITHUB', href: 'https://github.com/AffanShz/AgriNova-Landing-page' }
    ]
  }
];

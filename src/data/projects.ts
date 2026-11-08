/* ==========================================================================
   projects.ts — Tactical Project Archive & Dossiers.
   Single source of truth: add a project here and the work grid regenerates
   at build time. AffanShz Creative Portfolio.
   ========================================================================== */

export interface Project {
  n: string;
  title: string;
  category: string;
  year: string;
  status: string;
  desc: string;
  url: string;
  img?: string;
}

export const PROJECTS: Project[] = [
  {
    n: '001',
    title: 'DCC MOBILE',
    category: 'FLUTTER / BLOC / SUPABASE',
    year: '2026',
    status: 'ACTIVE',
    desc: 'Dinus Career Center — official UDINUS career app. Real-time job matching, application tracking, and background push sync on Supabase.',
    url: 'https://github.com/AffanShz/Dinus-Career-Center-Mobile',
    img: '/assets/work/dcc_v2.webp'
  },
  {
    n: '002',
    title: 'AGRINOVA',
    category: 'AGRITECH / AI SUITE',
    year: '2026',
    status: 'DEPLOYED',
    desc: 'Offline-first agronomy platform for local farmers. Computer-vision disease diagnostics, adaptive AI assistant, and AES-256 encrypted Hive cache.',
    url: 'https://github.com/AffanShz/Agrinova',
    img: '/assets/work/petani_maju_v2.webp'
  },
  {
    n: '003',
    title: 'LOCAL-LLM',
    category: 'MOBILE AI / EDGE INFERENCE',
    year: '2025',
    status: 'LIVE',
    desc: 'On-device AI and local language model inference architecture for private, resilient mobile workflows without cloud dependency.',
    url: 'https://github.com/AffanShz/Local-LLM'
  },
  {
    n: '004',
    title: 'MAHASISWA APP',
    category: 'DESKTOP / TAURI / RUST',
    year: '2025',
    status: 'PRODUCTION',
    desc: 'Lightweight, secure academic management desktop application leveraging Rust-backed Tauri and a modern TypeScript frontend.',
    url: 'https://github.com/AffanShz/mahasiswa-app-tauri'
  },
  {
    n: '005',
    title: 'AGRINOVA WEB',
    category: 'WEB / ASTRO SHOWCASE',
    year: '2024',
    status: 'DEPLOYED',
    desc: 'High-performance, content-focused landing page for smart agricultural technology, optimized for fast delivery with Astro.',
    url: 'https://github.com/AffanShz/AgriNova-Landing-page'
  }
];

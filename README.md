# AffanShz — Personal Portfolio & HUD Terminal

Situs portofolio pribadi interaktif milik **Affan Shahzada** (Mobile Software Engineer — Flutter, BLoC Architecture, Cloud Sync & On-Device AI). 

Dibangun dengan arsitektur **Zero-Build Static Web** berestetika retro-futuristik HUD / CRT terminal, tanpa ketergantungan framework bundler (no Webpack, Vite, or Node.js required).

---

## 📁 Struktur Folder

```text
Porto-404/
├── 404.html                    # Halaman 404 kustom ("Signal Lost")
├── index.html                  # Halaman utama portofolio & HUD terminal
├── work.html                   # Redirect helper menuju anchor #sec-work
├── serve.py                    # Local dev server (no-store cache header)
├── robots.txt                  # Aturan web crawler & sitemap pointer
├── sitemap.xml                 # XML sitemap SEO
├── unbelievablycrap-teardown.md# Dokumentasi riset & analisis arsitektur
├── assets/                     # Grafis, ikon, favicon, cover proyek, noise grain
│   ├── grain/                  # CRT noise texture
│   └── work/                   # Cover asset proyek & studi kasus
├── css/                        # Stylesheet modular (HUD, CRT, A11y, tema, grid)
├── fonts/                      # Self-hosted web fonts (PP Supply Sans & Mono)
└── js/                         # Skrip vanilla JS modular (terminal, clock, palette, data)
```

---

## 🚀 Menjalankan Secara Lokal

Proyek ini menyertakan `serve.py` khusus berbasis `http.server` Python yang mengirimkan header `Cache-Control: no-store` agar browser tidak menyimpan cache file statis saat pengembangan.

### Prasyarat
- Python 3.8+ terpasang di sistem.

### Menjalankan Server
Jalankan perintah berikut di terminal:

```bash
# Menjalankan di port default (8000)
python serve.py

# Atau tentukan custom port:
python serve.py 3000
```

Buka peramban di [http://localhost:8000](http://localhost:8000) atau [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 🌐 Cara Deploy ke GitHub Pages

Karena proyek ini murni file statis (HTML/CSS/JS), proses deploy ke GitHub Pages sangat instan:

1. Buat repository baru di GitHub dan unggah seluruh file proyek.
2. Buka repository di GitHub, lalu pilih tab **Settings**.
3. Pada bilah menu kiri, navigasi ke **Pages** (di bawah *Code and automation*).
4. Di bagian **Build and deployment**:
   - **Source**: Pilih `Deploy from a branch`.
   - **Branch**: Pilih `main` (atau `master`) dan folder `/ (root)`.
   - Klik **Save**.
5. Tunggu sekitar 1–2 menit hingga GitHub Actions selesai mempublikasikan situs.
6. Halaman `404.html` di root akan otomatis dikenali dan disajikan oleh GitHub Pages saat rute tidak ditemukan.

---

## 💡 Konfigurasi Tambahan

- **Custom Domain**: Tambahkan file `CNAME` atau atur di tab *Settings > Pages > Custom domain* (misal: `affanshz.dev`).
- **SEO & Canonical URL**: Perbarui domain pada [sitemap.xml](file:///D:/Porto-404/sitemap.xml) dan tag meta canonical di [index.html](file:///D:/Porto-404/index.html) saat domain produksi sudah aktif.

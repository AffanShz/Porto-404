# Bedah unbelievablycrap.com — dan cara membangun yang setara

Sumber: seluruh HTML/CSS/JS situs diunduh ke `_scan/uc/` (22 CSS, 53 modul JS, 7 mesh WebGL).
Setiap angka di bawah diambil dari file aslinya, bukan dikira-kira.

---

## 1. Fakta teknis (terukur)

| Item | Nilai |
|---|---|
| Framework | **tidak ada** |
| Build step | **tidak ada** — file statis, dimuat apa adanya (hash-less path) |
| Hosting | Vercel static, `cleanUrls`, cache `max-age=0, must-revalidate` + ETag |
| Library eksternal | GSAP 3.12.5 + CustomEase (jsDelivr), Barba 2.10.3 (jsDelivr). **Itu saja.** |
| 3D | WebGL mentah. **Nol byte three.js** |
| JS sendiri | 1.135.810 byte / 53 modul (rata-rata 21 KB per modul) |
| CSS sendiri | 166.282 byte / 23 file |
| Mesh 3D | 7.142.059 byte, disimpan sebagai **script JS base64**, bukan `.glb` |
| Font | PP Supply Sans / Mono, self-host, `.woff` (bukan woff2) |
| Source of truth desain | Figma 1920×1080 — node ID dikutip di komentar, mis. `Figma 14790:29095` |

Catatan mesh sebagai script, bukan fetch — dari komentar kode:
> `fetch()` is refused on `file://` and the model silently never arrived when the site was opened off disk.

Seluruh situs dirancang untuk **tetap jalan kalau dibuka langsung dari folder** tanpa server.

---

## 2. Empat halaman

| URL | `data-page` | Isi |
|---|---|---|
| `/` | `mask` | Block 01 hitam (patung scan + copy) → Block 02 putih (kepala 3D) → footer merah penuh layar |
| `/work` | `design` | Field kartu tak berujung yang di-drag |
| `/gallery` | `path` | Galeri kurva di CSS 3D |
| `/404` | `err` | **Satu canvas** — field tiket tak berujung + lensa CRT shader |

Nama halaman di `data-page` itulah gerbang setiap modul:

```js
window.PAGE.register('hud', function (scope) {
  if (scope.dataset.page !== 'mask') return;   // no-op, bukan error
  ...
  return function destroy(){ ... };
});
```

---

## 3. Tulang punggung: registry modul + Barba

Barba hanya menukar `<main data-barba="container">`; `<head>` tetap. Modul yang dulu IIFE akan mati setelah navigasi pertama — jadi semuanya jadi fungsi `boot`.

```js
/* lifecycle.js — inti, disederhanakan */
const modules = [];
function register(name, boot){ modules.push({ name, boot }); }

function mount(scope){
  const downs = [];
  for (const m of modules){
    let down;
    try { down = m.boot(scope); }
    catch (e){ console.error(`[page] "${m.name}" failed:`, e); continue; }
    if (typeof down === 'function') downs.push([m.name, down]);
  }
  return { scope, unmount(){ for (let i = downs.length-1; i >= 0; i--) downs[i][1](); } };
}
window.PAGE = {
  register,
  mount,
  bindings(){                       // listener yang wajib dilepas saat unmount
    const offs = [];
    return Object.assign(
      (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); },
      { release(){ offs.forEach(f => f()); offs.length = 0; } }
    );
  }
};
```

**Aturan yang tidak boleh dilanggar:** modul query **di dalam `scope`**, tidak pernah `document`.
Dua container hidup bersamaan selama transisi — `document.getElementById` akan memberi halaman masuk elemen halaman keluar.

**Layer persisten di luar container** (survive navigasi, ditulis sekali): grain, loader, overlay transisi, gerbang mobile.

**Semua halaman memuat daftar script yang sama persis.** Modul yang tidak relevan no-op; mesh 3D di-inject on demand oleh renderer-nya sendiri, jadi halaman yang tidak menampilkan patung tidak membayar 5,4 MB.

---

## 4. Katalog teknik (yang membuat situsnya terasa mahal)

### 4.1 Tipografi `line-height: 0.5` — dan kenapa tidak rusak

Kotak teks jauh lebih pendek dari glyph; glyph melimpah keluar. Itu disengaja untuk merapatkan baris jadi "pita" — tapi begitu dipakai dengan `background-clip: text`, gradiennya diukur ke kotak yang salah dan baris kedua hilang.

Perbaikannya satu baris:

```css
.title{
  font-size: clamp(2.75rem, 6.7vw, 8rem);
  line-height: .5;                 /* pita, bukan teks normal */
  letter-spacing: -.04em;
  padding-top: .35em;              /* PP Supply Sans: content box 1.2em, */
  padding-bottom: .35em;           /* jadi overflow 0.35em atas & bawah */
  background: linear-gradient(to top, rgba(195,195,195,0) 10%, #c3c3c3 82%);
  -webkit-background-clip: text;
          background-clip: text;
  color: transparent;
}
```

`.35em` bukan selera — itu `(1.2 − 0.5) / 2`, jarak glyph melimpah keluar kotak baris. Tanpa itu, stop gradien meleset ~35%.

### 4.2 Layout: X proporsional, Y piksel

Aturan yang dipakai konsisten di `hud.css`, `tscroll.css`, `footer.css`:

- **X** → `%` atau `calc()` terhadap `vw` (komposisi harus melar)
- **Y** → `px`, dijangkar ke tepi yang diukur desain (dari atas untuk headline, dari bawah untuk footline)
- Satu pengecualian: elemen yang harus "di tengah layar berapa pun tingginya" pakai `top: 50%`

Alasan dari komentar footer: footline di `y=828` dari frame 1080 akan mendarat di tengah layar yang tingginya bukan 1080.

```css
.hud__coord{ position:absolute; top:32.9%; width:283px; }   /* 355/1080 */
.hud__panel{ position:absolute; left:10px; bottom:90px; }    /* bar 28 + 10 + 42 + 10 */
```

### 4.3 Film grain tanpa JavaScript

Satu div, tekstur noise berulang, animasi `background-position` bertahap. Nol per-frame JS.

```css
.grain{
  position: fixed; inset: 0; z-index: 999; pointer-events: none;
  --grain-size: 5em; --grain-opacity: .13;
  --grain-blend: overlay; --grain-contrast: 300%; --grain-brightness: 80%;
  background: url('../assets/grain/noise.png') 50% 50% / var(--grain-size) repeat;
  opacity: var(--grain-opacity);
  filter: contrast(var(--grain-contrast)) brightness(var(--grain-brightness));
  mix-blend-mode: var(--grain-blend);
}
.grain[data-grain-animate="true"]{ animation: grain .85s steps(1, end) infinite; }
@keyframes grain{
  0%{ background-position: 0 0; }      20%{ background-position: -.5em .3em; }
  40%{ background-position: .4em -.2em; } 60%{ background-position: -.3em -.4em; }
  80%{ background-position: .2em .5em; }
}
/* halaman gelap butuh setelan sendiri — overlay tidak melakukan apa-apa di atas hitam */
body[data-page="about"] .grain{ --grain-blend: lighten; --grain-opacity:.06;
                                --grain-contrast:50%; --grain-brightness:100%; }
```

`steps(1, end)` wajib: interpolasi halus membuat noise *bergerak*, bukan *berganti*.

### 4.4 Saturasi merah + dither — dua bagian yang saling mengunci

Model dirender **abu-abu murni**. Blend `saturation` di atas abu-abu murni **tidak melakukan apa pun** — abu tidak punya hue untuk disaturasi. Jadi shader memberi setiap piksel noise warna acak kecil:

```glsl
// frag, tentang figure
vec2 sp = gl_FragCoord.xy + uSeed;
vec3 noise = vec3(hash(sp), hash(sp + 17.3), hash(sp + 41.7)) - 0.5;
gl_FragColor = vec4(clamp(base + noise * uGrain, 0.0, 1.0), a);
```

```css
.about__fx{
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background:#e8271c;
  mix-blend-mode: saturation;   /* amplifies the dither into colour speckle */
  opacity: .14;                 /* THE intensity dial */
}
```

Pembagian kerja yang diukur penulisnya:
- `grain` shader → **kepadatan** (turun 0.09→0.022, chroma cuma 164→128)
- `opacity` layer → **intensitas** (ini dial yang sebenarnya)

Kalau salah satu dimatikan, yang lain jadi tidak berfungsi.

### 4.5 Robek (tear) — noise **sebelum** threshold

Ini satu-satunya trik yang perlu dihafal. Bukan mengacak outline setelahnya; tambahkan noise ke **signed distance**, lalu threshold. Patch noise bisa membawa sebagian bidang melewati nol → serpihan lepas.

```glsl
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p, int oct){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++){
    if (i >= oct) break;
    v += a * vnoise(p); p *= 2.03; a *= 0.5;
  }
  return v;
}
/* positif di sisi putih */
float field(vec2 uv){
  float y    = mix(uv.y, 1.0 - uv.y, uFlip);
  float edge = mix(-uDispAmp, 1.0 + uDispAmp, uP);   // sapuan 0..1
  float n    = fbm(vec2(uv.x * uAspect, y) * uDispScale
                   + vec2(0.0, uTime * uDispDrift), uDetail) - 0.5;
  return (edge - y) + n * uDispAmp * 2.0;           // <-- noise SEBELUM threshold
}
float maskAt(vec2 uv){ return smoothstep(-uSoft, uSoft, field(uv)); }
```

Konstanta yang dipakai (dari `js/dissolve-look.js`, dipakai bersama oleh transisi halaman **dan** blob kursor):

```js
window.DISSOLVE_LOOK = {
  dispAmp:    0.095,  // seberapa jauh noise menyeret batas (fraksi tinggi layar)
  dispScale:  12.2,   // ukuran serpihan · tinggi = shrapnel, rendah = gelombang
  dispDetail: 5,      // oktaf · 1 = goyang halus, 5 = puing
  dispDrift:  0.0,    // kecepatan pola merangkak
  soft:       0.001,  // setengah-lebar threshold · kecil = potongan tajam
  grain:      0.29,
};
```

Aberasi kromatik di sini hampir gratis: mask di-sample **tiga kali** dengan offset vertikal kecil, sekali per channel. Mereka setuju di mana-mana kecuali beberapa piksel di batas.

```glsl
float cR = smoothstep(0.0, 1.0, t + uAberr);
float cG = smoothstep(0.0, 1.0, t);
float cB = smoothstep(0.0, 1.0, t - uAberr);
```

### 4.6 Bloom yang digambar, bukan di-blur

Tiga render target (bright pass + dua separable blur) untuk titik-titik kecil tidak membeli apa pun dibanding halo eksponensial dari jarak yang **sudah dihitung**:

```glsl
halo  = exp(-r / max(rad * uGlowSpread, 1e-3)) * uGlowGain;
float fx = exp(-abs(f.y)/max(rad*.22,1e-3)) * exp(-abs(f.x)/max(rad*uFlareLen,1e-3));
float fy = exp(-abs(f.x)/max(rad*.22,1e-3)) * exp(-abs(f.y)/max(rad*uFlareLen,1e-3));
cross = (fx + fy) * uFlare * step(0.72, rnd);   // hanya beberapa terang yang flare
```

### 4.7 Kuas reveal di ruang layar

Hole yang digambar pointer **tidak boleh ikut berputar** saat kepala berputar. Jadi koordinatnya ruang layar, disimpan sebagai array uniform:

```glsl
uniform vec3 uRevPts[14];   // x, y (0..1), z = sisa umur goresan
uniform vec2 uRes;

float revealAt(){
  vec2 uv = gl_FragCoord.xy / max(uRes.y, 1.0);   // tinggi di kedua sumbu -> bulat
  if (uRevWarp > 0.0001){                        // warp LOOKUP, bukan hasilnya
    float n1 = vnoiseR(uv * uRevWarpScale + vec2(0.0, uRevTime * uRevWarpSpeed));
    float n2 = vnoiseR(uv * uRevWarpScale + vec2(5.2, uRevTime * uRevWarpSpeed + 1.3));
    uv += (vec2(n1, n2) - 0.5) * uRevWarp * uRevRadius * 2.0;
  }
  float r = 0.0;
  for (int i = 0; i < 14; i++){
    if (uRevPts[i].z <= 0.0) continue;
    vec2  c = vec2(uRevPts[i].x * uRes.x / max(uRes.y,1.0), uRevPts[i].y);
    float d = length(uv - c) / max(uRevRadius, 1e-4);
    /* Gaussian, bukan cakram keras: goresan harus MENJUMLAH saat bertumpuk,
       jadi drag lambat membuka lubang lebih lebar daripada sekali usap */
    r += uRevPts[i].z * exp(-d * d * mix(6.0, 1.6, clamp(uRevSoft, 0.0, 1.0)));
  }
  return clamp(r, 0.0, 1.0) * clamp(uRevMax, 0.0, 1.0);
}
```

Dua lapis: `uRevMode = 1` lapisan luar yang **dimakan** reveal; `uRevMode = -1` tengkorak yang **hanya** terlihat lewat lubang.

```glsl
if (a <= 0.004) discard;   // DISCARD, bukan alpha 0 —
                           // fragmen alpha 0 tetap menulis DEPTH, dan tengkorak
                           // tak terlihat akan melubangi wajah di depannya
```

### 4.8 Transisi halaman

Tiga implementasi, dipilih registry: `SHEETFX` (default) → `IRIS` → `LIQUID` → fallback grid piksel.

**Fallback grid piksel** (12 kolom, murni GSAP):

```js
const pixelHorizontalAmount = 12;
const transitionDuration    = 1;
const pixelFadeDuration     = 0.2;
const pixelOverlap          = 0.3;

const clipStart    = Math.min(pixelFadeDuration, transitionDuration * 0.5);
const clipDuration = Math.max(0.001, transitionDuration - 2 * clipStart);
const stepDur      = clipDuration / pixelHorizontalAmount;

lines.forEach((line, i) => {
  const pixels      = [...line.querySelectorAll('[data-transition-pixel]')];
  const revealTime  = clipStart + i * stepDur;
  const fillStart   = Math.max(0, revealTime - pixelFadeDuration);
  const perPixelMin = pixelFadeDuration / pixels.length;
  const perPixelDur = perPixelMin * (1 - pixelOverlap) + pixelFadeDuration * pixelOverlap;
  const spread      = Math.max(0, pixelFadeDuration - perPixelDur);

  tl.to(pixels, { opacity: 1, duration: perPixelDur, ease: 'none',
                  stagger: { amount: spread, from: 'random' } }, fillStart);
  tl.to(pixels, { opacity: 0, duration: perPixelDur, ease: 'none',
                  stagger: { amount: spread, from: 'random' } },
                  Math.min(transitionDuration, revealTime + stepDur));
});

// clip-path turun dalam 12 langkah keras — langkah inilah yang terbaca sebagai efek
tl.to(next, { clipPath: 'polygon(0% 0%,100% 0%,100% 100%,0% 100%)',
              webkitClipPath: 'polygon(0% 0%,100% 0%,100% 100%,0% 100%)',
              ease: `steps(${pixelHorizontalAmount}, start)`, duration: clipDuration }, clipStart);
```

Tanpa flicker acak yang menunggangi langkah keras itu, clip-path sendirian cuma terlihat seperti wipe biasa.

**Transisi sheet** (yang dipakai): robek yang sama dengan block 01→02, dijalankan **satu arah** untuk kedua fase. `uOut` cuma membalik sisi mana yang opaque — kalau dijalankan maju lalu mundur, paruh kedua terbaca seperti kesalahan yang dikoreksi.

```js
coverMs: 520, uncoverMs: 1400, outFrom: 0.36, navScale: 2.7
// navigasi: 520*2.7 = 1404ms isi, 1400*2.7 = 3780ms bersih
```

### 4.9 Loader — persentase yang jujur

```js
pTime  = elapsed / MIN;              // plafon: tidak boleh selesai sebelum MIN
pReal  = decoded / total;            // kebenaran
pFloor = elapsed / MAX;              // lantai: selalu mencapai 100 pada MAX
p      = Math.min(pTime, Math.max(pReal, pFloor));
```

Lantai mencegah koneksi dingin macet di 62%; plafon mencegah cache hangat berkedip 0→100 dalam satu frame.

Urutan lima langkah (dari komentar): copy blur-in → persen menghitung → copy bergerak `left:200 → left:1594` (satu geseran 1394px, **tidak keluar layar**) sementara garis merah tumbuh → 100%: garis 3px membanjiri ke atas (650ms) → putih menutup di atasnya (550ms) dengan gradien **identik** `.stage`, sehingga saat loader dihapus tidak ada jahitan.

```css
.loader__line{ position:absolute; left:0; bottom:0; height:3px; width:0;
               background: var(--ui-red, #e8271c); }
.loader.is-flooding .loader__line{ height:100%; transition: height .65s var(--ease-out); }

.loader__white{
  position:absolute; left:0; right:0; bottom:0; height:0;
  background: linear-gradient(to bottom, #fff 0%, #afafaf 162.59%)
              bottom center / 100vw 100vh no-repeat;   /* dipin ke viewport */
}
.loader.is-covering .loader__white{ height:100%; transition: height .55s var(--ease-out); }
```

`--ease-osmo: cubic-bezier(.625,.05,0,1)` untuk copy yang berangkat (lambat di awal — bagus untuk sesuatu yang mengumpulkan kecepatan). `--ease-out: cubic-bezier(.22,.61,.36,1)` untuk banjir dan cover (osmo membuat merah nyaris belum terangkat sebelum putih mulai menutupinya — terukur).

Animasi halaman ditahan, bukan ditunda:

```css
html.is-loading [data-barba="container"] .anim-line{ animation-play-state: paused; }
```

Di-scope ke container **dengan sengaja**: `.anim-line` juga dipakai copy loader sendiri — selector tanpa scope akan menjeda loader jadi layar hitam kosong.

### 4.10 Entrance per baris

```css
.anim-line{
  opacity: 0;
  filter: blur(var(--line-blur, 7px));
  animation: lineIn var(--line-ms, .52s) cubic-bezier(.22,.61,.36,1) both;
  animation-delay: calc(var(--i,0) * var(--line-step, 42ms) + var(--group-delay, 0ms));
}
@keyframes lineIn{
  from{ opacity:0; filter: blur(var(--line-blur,7px)); }
  60% { opacity: var(--in-opacity, 1); }
  to  { opacity: var(--in-opacity, 1); filter: blur(0); }
}
```

Dengan ~250 baris dan 14ms stagger: ~120 baris di dalam blur bersamaan → **turun ke ~50fps**. Karena itu jadi tiga mode (`off` / `fade` / `blur`), default **off**.

### 4.11 Scramble hover

```js
const glyphs = '▘▙▚▛▜▝▞▟▖▗▄▀█▌▐▓▒░';

function step(){
  let out = '', done = 0;
  for (const c of q){
    if (c.to === ' '){ out += ' '; done++; continue; }
    if (frame >= c.end){ out += c.to; done++; }
    else if (frame >= c.start){
      if (!c.ch || Math.random() < 0.28) c.ch = glyphs[(Math.random()*glyphs.length)|0];
      out += c.ch;                    // di-hold beberapa frame: di 120Hz,
    }                                 // glyph baru tiap frame = blur abu-abu
    else out += c.from;
  }
  el.textContent = out;
  if (done === q.length) return;
  frame++; raf = requestAnimationFrame(step);
}
// tiap karakter: start = rand*12, end = start + rand*14 + 6
```

Lebar label dikunci ke string terlebar (diukur setelah `document.fonts.ready`) supaya chip tidak berubah ukuran empat kali selama urutan.

### 4.12 Marquee dua salinan

```css
.hud__tick{ display:flex; animation: ftr-run 18s linear infinite; }
@keyframes ftr-run{ from{ transform: translateX(0); } to{ transform: translateX(-50%); } }
```

Markup berisi dua salinan persis; `-50%` menjahit tanpa celah.

### 4.13 Daftar award yang tidak pernah habis

Di-clone **sekali**, perjalanan diambil **modulo tinggi aslinya**. Tinggi diukur dari anak-anak asli **sebelum** clone bergabung, setelah `document.fonts.ready` (diukur sebelum font mendarat, setiap baris masih baris fallback dan seam-nya kelihatan).

### 4.14 Field tak berujung = modulo

```js
// posisi sel diambil terhadap ukuran total field, lalu di-wrap
// kartu yang keluar satu tepi adalah kartu yang masuk di tepi lain
```

Angka "feel" dari baseline yang dipertahankan: `positionLerp: 0.2`, `xToYInfluence: 0.1` (drag horizontal merembes ke vertikal), `maxDelta: 80` (setiap event di-clamp).

### 4.15 Sphere CSS 3D

```js
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < n; i++){
  const y  = 1 - (i + 0.5) * 2 / n;              // merata di cos(lat)
  const r  = Math.sqrt(1 - y*y);
  const lon = i * GOLDEN_ANGLE;
  // posisi kartu di (r*cos(lon), y, r*sin(lon)) * radius
}
```

Dua jebakan yang tercatat di kode:

```css
.sphere-item{ transform-origin: 0 0; }   /* default 50% 50% membuat translate(-50%,-50%)
                                            berkomposisi dengan origin dan seluruh awan
                                            mengorbit pivot dengan radius setengah diagonal */
.sphere-viewport{ mix-blend-mode: multiply; }  /* di LAYER, bukan per kartu:
                                                  blend per kartu di dalam preserve-3d
                                                  memaksa grup flat → sphere runtuh */
```

Halftone ghost: sphere kedua, rotasi yang sama dengan delay, `mask-image` tile SVG titik yang di-generate di JS.

### 4.16 Gerbang mobile — yang paling patut ditiru

Bukan overlay di atas situs yang jalan. **Situsnya tidak dinyalakan.**

```html
<script>
(function () {
  var gated = !/[?&]mobile(&|=|$)/.test(location.search) &&
              window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
  if (gated) document.documentElement.className += ' is-gated';
})();
</script>
```

```css
html.is-gated body > [data-barba="container"]{ display: none !important; }
```

```js
const GATE_OK = { gate: 1, 'work-cursor': 1 };   // hanya dua modul yang jalan
if (gated && !GATE_OK[m.name]) continue;
```

`display:none` — bukan `visibility` atau `opacity`. Dua yang terakhir tetap mempertahankan box, jadi phone tetap layout, tetap composite, dan setiap canvas tetap punya ukuran yang layak digambar.

Gerbang ditentukan **sebelum paint pertama**, inline di `<head>`. Kalau dari modul, phone melihat layout yang seharusnya disembunyikan berkedip dulu.

---

## 5. Disiplin performa (bagian paling berharga)

Peralatannya sendiri:

| Flag | Fungsi |
|---|---|
| `?fps` | readout: FPS, **LOAD**, p95, WORST, LOOPS |
| `?off=<layer>` | matikan satu efek untuk mengukur biayanya |
| `?tune` | panel tuning live (juga aktif otomatis di localhost) |
| `?skip` | lewati intro |
| `?mobile` | paksa buka gerbang phone |

Alasan `LOAD` (porsi budget frame yang terpakai) lebih berguna dari FPS:
> requestAnimationFrame tidak bisa lebih cepat dari refresh layar, jadi laptop 120Hz membaca 120 dan berhenti. FPS adalah detektor kesalahan, bukan ukuran kecepatan.

**Temuan yang terukur:**

| Perubahan | Efek |
|---|---|
| Matikan `readPixels` siluet di block 02 | 71 → **81 fps**, p95 41.6 → **33.3 ms** |
| `renderScale` 0.75 | 82 fps, **tapi** midtone hilang — tidak dipakai |
| Keduanya sekaligus | 78 fps — **tidak menumpuk**, keduanya meredakan stall yang sama |
| Blur+opacity 250 baris | turun ke **~50 fps** → jadi setting, default off |
| 2 juta tris → 250.732 tris | 36 MB → 5,4 MB (hero) |
| 250.732 → 17.848 tris | 5,4 MB → **239 KB** (figur kecil, 23× lebih kecil) |

Pelajaran yang bisa langsung dipakai:

1. **`readPixels` adalah `glFinish`.** Sinkron CPU-GPU. Biayanya tidak muncul di median — itu sebabnya `LOAD` terbaca 6–8% sementara p95 rusak. Biaya yang bersembunyi dari median adalah biaya yang akan salah kamu tuduh.
2. **Jangan turunkan resolusi pada efek dither.** Dither membeli abu-abu dengan menukar resolusi spasial; kurangi piksel dan tonalitasnya runtuh.
3. **Animasi `background-position` = repaint di main thread.** Pakai `transform` pada layer yang dipromosikan.
4. **Hatch miring butuh periode horizontal, bukan periode gradien.** `step = period / sin(angle)`: `5 / sin(105°) = 5.176px`. Geser 5px dan loop-nya melompat di tengah garis.
5. **11 konteks WebGL di satu halaman itu nyata.** Penulis mencatatnya sebagai tersangka stall 33.3ms yang tersisa.
6. **Upload canvas→texture tiap frame**: 3 canvas full-viewport × ~5.9 MP = **18 juta piksel per frame** dari CPU ke GPU.

---

## 6. Cara membangun yang setara — urutan yang benar

Jangan mulai dari efek. Efek adalah 20% terakhir dan 80% dari waktu debugging. Urutannya:

### Tahap 0 — keputusan (1 hari)

- **Tanpa framework.** Statis, tanpa build. Vite hanya untuk HMR lokal kalau mau; hasilnya tetap di-deploy apa adanya.
- GSAP + Barba dari CDN (atau vendor lokal — situs ini memilih CDN dan menerima bahwa transisi jatuh ke wipe kalau CDN mati; **grid tidak boleh** bergantung CDN karena grid *adalah* halamannya).
- Figma sebagai source of truth, 1920×1080. Setiap angka di CSS harus bisa dilacak ke node ID. Ini yang membuat "kok bergeser" tidak pernah jadi misteri.

### Tahap 1 — tulang punggung (2 hari)

1. `base.css` dengan token: font stack, 5–6 abu, satu merah, `--hud-size`, `--tracking`.
2. `lifecycle.js` (kode di §3), `transition.js` dengan fallback grid piksel.
3. Dua halaman kosong + `<body data-barba="wrapper">` + `<main data-barba="container" data-page="...">`.
4. Layer persisten di luar container: grain, overlay transisi.
5. **Verifikasi:** klik antar halaman, tidak ada modul yang jalan dua kali, tidak ada listener yang bocor (`PAGE.live` / `PAGE.pending` dicek di console).

### Tahap 2 — sistem tipografi (2 hari)

- `line-height:.5` + padding `.35em` (§4.1).
- Aturan X-proporsional / Y-piksel (§4.2).
- `.anim-line` dengan `--i` per baris.
- Grain (§4.3).
- **Jangan lanjut sebelum dua halaman kosong ini sudah terasa benar.** Semua yang datang setelahnya duduk di atas keputusan ini.

### Tahap 3 — loader (2 hari)

§4.9. Tiga hal yang tidak boleh dilewat:
- putihnya pakai gradien yang **identik** dengan halaman di belakangnya, dipin ke `100vw 100vh`
- `animation-play-state: paused` di-scope ke container
- persentase pakai `min(pTime, max(pReal, pFloor))`

### Tahap 4 — satu objek 3D (1–2 minggu)

Ini bagian terberat dan yang paling menentukan apakah situsnya terasa "mahal".

Pipeline aset:
```
scan / Meshy / Blender → .glb
  → gltf-transform optimize (weld, prune, quantize)
  → decimator (meshoptimizer simplify) → target 20k–250k tris
  → quantize POSITION ke uint16 + NORMAL ke int8
  → base64 ke dalam .js  (bukan .glb — supaya jalan di file://)
```

Renderer minimal, ~200 baris, tanpa three.js:

```js
const gl = canvas.getContext('webgl', { antialias: true, alpha: true,
                                        premultipliedAlpha: false });
// buffer: UNSIGNED_SHORT dinormalisasi -> shader dequantize di GPU
gl.vertexAttribPointer(0, 3, gl.UNSIGNED_SHORT, true, 0, 0);   // posisi
gl.vertexAttribPointer(1, 3, gl.BYTE,           true, 0, 0);   // normal
```

Vertex shader cukup tiga hal: dequantize, rotasi per-setengah-model (baca sisi dari `sign(p.x)` — satu mesh, satu draw call), lalu kirim posisi dan normal.

Fragmen: `ambient + diffuse*NdotL + rim*fresnel`, dikali `tone`, ditambah `noise*grain`. Itu saja.

Kamera: **solve**, jangan hardcode.

```js
// 'contain': bola radius r terlihat penuh pada jarak r / sin(halfAngle)
const halfY = fov / 2;
const halfX = Math.atan(Math.tan(halfY) * Math.max(aspect, 0.01));
const binding = Math.min(halfY, halfX);              // sumbu mana pun mengikat
const dist = r / Math.sin(binding);
```

Untuk siluet yang mengalirkan teks: render ke buffer 48×160, `readPixels` 9×/detik, dorong padding baris sesuai lebar siluet di baris itu. **Ini mahal — pakai hanya kalau benar-benar ada teks yang mengalir di sekitarnya.**

### Tahap 5 — robek / transisi (3–5 hari)

§4.5 dan §4.8. Satu shader, dua pemakai: transisi antar block **dan** transisi antar halaman. Satu file konstanta bersama (`dissolve-look.js`), karena dua salinan angka akan melenceng pada penyetelan pertama.

Kalau transisi WebGL gagal (tanpa WebGL, konteks mati, shader gagal compile), **kembali ke grid piksel**, jangan ke cut. Ini pola yang dipakai di seluruh situs: setiap efek punya fallback yang masih terasa disengaja.

### Tahap 6 — kosakata motion (1 minggu)

Scramble, marquee, scramble-width-lock, entrance stagger, drag inertia. Semua kecil; yang membuatnya terasa satu sistem adalah **kurva easing yang sama**:

```js
CustomEase.create('osmo', '0.625, 0.05, 0, 1');
gsap.defaults({ ease: 'osmo', duration: 0.6 });
```

Satu kurva untuk semua. Itu 70% dari "kok terasa satu tangan yang bikin".

### Tahap 7 — panel tuning (3–4 hari, dan ini yang menghemat berminggu-minggu)

Setiap efek punya `CONFIG` objek datar; panel membaca dan menulisnya; ada **Copy settings** yang mengeluarkan objek itu untuk ditempel balik ke kode.

```js
// tuner.js — inti
const rows = [];
function row(label, get, set, opts={}){ rows.push({ label, get, set, ...opts }); }

// self-activate: localhost, file://, atau ?tune
const ON = /localhost|127\.0\.0\.1/.test(location.hostname)
        || location.protocol === 'file:'
        || /[?&]tune(&|=|$)/.test(location.search);
if (!ON) return;
```

Kenapa ini bukan kemewahan: komentar di kode itu penuh angka hasil eksperimen (`0.14 dengan tint #FCFFF8 mendarat di green lift +12 dan chroma spread 28`). Tanpa panel, setiap keputusan itu butuh reload + tebak + edit + reload. Dengan panel, satu menit.

**Satu jebakan yang mereka kena:** panel menyimpan nilai berdasarkan **label** baris, dan memulihkannya menimpa kode pada load berikutnya. Saat default berubah, siapa pun yang pernah menyentuh baris itu tetap memakai angka lama — perubahan rilis, deploy, dan tidak melakukan apa-apa. Kalau kamu bangun panel, beri version key di store, dan naikkan saat default berubah.

### Tahap 8 — pass performa (bukan sekali, tapi tiap fitur)

Bangun `?fps` **sebelum** mengoptimasi, bukan sesudah. Urutan penyelidikan:

1. `LOAD` naik? → sesuatu jalan tiap frame.
2. `p95` jelek tapi `LOAD` bagus? → stall sinkron (`readPixels`, `getBoundingClientRect` di loop, layout thrash).
3. `LOOPS` > 3–4? → beberapa rAF menjalankan kerja yang bisa digabung ke satu ticker.

---

## 7. Yang layak dicontek vs yang sebaiknya dilewati

**Ambil:**
- Registry modul per halaman + `destroy()` (§3). Ini yang membuat situs 4 halaman ini tidak jadi spaghetti.
- Disiplin tipografi + aturan X/Y (§4.1–4.2).
- Robek noise-sebelum-threshold (§4.5) — satu trik, dipakai tiga tempat.
- Matematika loader (§4.9).
- Panel tuning (§6 Tahap 7).
- Gerbang mobile yang benar-benar tidak menyalakan situs (§4.16).
- Instrumentasi `?fps` dengan LOAD & p95.

**Pertimbangkan ulang:**
- **11 konteks WebGL** di satu halaman. Penulis sendiri mencatatnya sebagai tersangka. Kalau mulai dari nol, satu konteks + framebuffer bersama (opsi `sharedHead` yang bahkan belum jadi default di sana).
- **250 baris copy** yang mengalir di sekitar siluet. Efeknya bagus; biayanya `readPixels` 9×/detik seumur halaman.
- **Mesh base64 di dalam JS.** 5,4 MB di satu file tidak bisa di-stream atau di-cache terpisah. `fetch()` + `arrayBuffer` lebih baik di HTTP — mereka memilih base64 karena `file://`, dan itu pilihan yang benar *untuk alur kerja mereka*.
- **Font PP Supply** berlisensi (Pangram Pangram). Untuk belajar, cari grotesk mono yang setara (Space Grotesk, Archivo, JetBrains Mono untuk mono).

**Jangan tiru tanpa berpikir:**
- `.woff` bukan `.woff2` — komentar mereka mengakui ini karena tidak ada toolchain brotli saat build. Kamu punya; pakai woff2.
- 23 file CSS. Itu konsekuensi dari "tanpa build step" dan bisa dipertahankan, tapi jumlahnya bukan tujuan.

---

## 8. Estimasi jujur

| Peran | Waktu untuk setara |
|---|---|
| Skeleton + transisi + loader + type system | 1 minggu |
| Satu scene 3D (mesh + shader + kamera) | 1–2 minggu |
| Robek + transisi WebGL | 1 minggu |
| Field/grid/gallery | 1–2 minggu |
| Motion vocabulary + tuning panel | 1–2 minggu |
| Pass performa & polish | 2–4 minggu |
| **Total, satu orang yang sudah pernah bikin ini** | **2–3 bulan** |
| **Total, kalau baru pertama kali** | **4–6 bulan** |

1,1 MB JavaScript tulisan tangan. Itu bukan template. Itu portofolio seorang creative developer yang, dari komentarnya sendiri, mengiterasi setiap angka terhadap render.

---

## 9. Kalau kamu mau versi 20% yang membawa 80% efeknya

Urutan prioritas kalau waktunya terbatas:

1. **Tipografi + grain + satu easing.** Dua halaman kosong dengan aturan §4.1–4.3 dan kurva `osmo` sudah lebih baik dari 90% portofolio.
2. **Loader §4.9.** Ini yang memberi kesan "situs ini dibuat dengan sengaja" di 3 detik pertama.
3. **Robek §4.5** sebagai satu-satunya transisi. Satu shader, satu file konstanta.
4. **Scramble + marquee §4.11–4.12.** Murah, langsung terasa.
5. **Satu objek 3D** dengan shader 30 baris dan kamera yang di-solve.

Yang **tidak** masuk daftar: field tak berujung, galeri kurva, 404 canvas, x-ray. Itu hiasan di atas fondasi yang sudah benar — dan tanpa fondasi itu, semuanya cuma terbaca sebagai efek.

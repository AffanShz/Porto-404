# affanshz-portfolio

Personal portfolio website of **Affan Shahzada** featuring a retro-futuristic HUD / CRT terminal aesthetic, migrated from a static HTML site to [Astro](https://astro.build).

- **Target Domain:** [affanshz.dev](https://affanshz.dev)
- **Framework:** Astro 5 (Static Output)

---

## 📁 Project Structure

```text
├── public/                 # Static assets served as-is (images, fonts, textures)
│   ├── assets/             # Project covers, icons, and CRT noise textures
│   └── fonts/              # Self-hosted web fonts (PP Supply Mono & Sans)
├── src/
│   ├── components/         # Astro UI components (Hero, WorkGrid, ErrRoom, Bar, Gate)
│   ├── data/               # Project data and structured content (projects.ts)
│   ├── layouts/            # Base HTML shells and shared layouts (Layout.astro)
│   ├── pages/              # Route entry points (index.astro)
│   └── styles/             # Modular CSS stylesheets (HUD, CRT, UI, Loader)
├── astro.config.mjs        # Astro configuration (output: 'static')
├── package.json            # Project dependencies and build scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Server

```bash
npm run dev
```

Starts the local development server at `http://localhost:4321`.

### 3. Build for Production

```bash
npm run build
```

Generates an optimized static build in the `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

Serves the contents of `dist/` locally to verify production output.

---

## 🌐 Deployment Notes

With `output: 'static'` configured in `astro.config.mjs`, the site compiles to zero-runtime static files in `dist/`.

### GitHub Pages

1. Navigate to **Settings > Pages** in your GitHub repository.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Use the Astro starter deployment workflow (or set up an action running `npm run build` with artifact deployment from `dist`).
4. To link the custom domain, enter `affanshz.dev` under **Custom domain** (or add a `public/CNAME` file containing `affanshz.dev`).

### Cloudflare Pages

1. In the Cloudflare dashboard, go to **Workers & Pages > Create application > Pages > Connect to Git**.
2. Select this repository and configure build settings:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. After deployment, navigate to **Custom domains** and add `affanshz.dev`.

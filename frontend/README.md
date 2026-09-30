# Movies.snishad — Ultra-Fast Movie & Web Series Streaming Frontend 🎬🍿

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-rose.svg)](LICENSE)

A modern, lightning-fast streaming frontend for watching and downloading movies, web series, and anime in HD/4K. Built with **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS**, and **Lucide Icons**.

---

## 👨‍💻 Developer & Credits

Designed, built, and maintained by **SNishad**:
* **Instagram**: [@snishad.me_](https://instagram.com/snishad.me_)
* **Email**: [snishad01985@gmail.com](mailto:snishad01985@gmail.com)

### 🐛 Bug Reporting & Feedback
> **Community Notice**: If you find any bugs or issues, please report them to me on Instagram (**[@snishad.me_](https://instagram.com/snishad.me_)**). I know it may have bugs, but I don't know everything — your bug reports, feedback, and pull requests are warmly welcome to help make this platform better!

### 💼 Custom Website Development at Affordable Prices
> **Need a custom website?** Want your own movie streaming site, web app, e-commerce store, or portfolio built at an **affordable price**?  
> Connect with me directly on Instagram (**[@snishad.me_](https://instagram.com/snishad.me_)**) or send an email to **snishad01985@gmail.com**!

---

## ✨ Features & Highlights

* **Instant Click Navigation**: Fast in-memory caching and optimized prefetch elimination for instantaneous page loads.
* **Clean, Unobstructed Video Player**: Pure native video playback without annoying overlay controls blocking the video.
* **Smart Multi-Server Switching**: Seamless switching between working streaming servers (`Server 1`, `Server 2`, etc.) with exact timestamp resume.
* **One-Click Direct Downloads**: Single direct download button integrated with `02moviedownloader.top` for 1080p, 720p, and 480p files.
* **Hourly Refreshing Trending**: Always shows latest top hits, updated automatically every hour from TMDB.
* **Whole-Site Shimmer Skeletons & Lazy Loading**: Smooth loading placeholders and zero layout shifts.
* **Single `.env` Setup**: Ultra-simple configuration with just one `.env` file.

---

## 🚀 Super Easy 3-Step Setup (Anyone Can Deploy)

### Step 1: Install Dependencies
Make sure you have [Node.js 18+](https://nodejs.org/) installed, and the backend running on port 3000.

```bash
git clone https://github.com/snishad0198/Movies.snishad.git frontend
cd frontend
npm install
```

### Step 2: Configure `.env`
Copy the example file to create your `.env`:

```bash
cp .env.example .env
```

Open `.env` and verify the backend URL:
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
BACKEND_API_KEY="movies-snishad-secure-internal-token-2026"
NEXT_PUBLIC_SITE_NAME="Movies.snishad"
NEXT_PUBLIC_SITE_URL="http://localhost:3001"
```

### Step 3: Run the Frontend
```bash
npm run dev
```

Visit **`http://localhost:3001`** in your browser!

---

## 🌐 Production Deployment (Vercel / VPS / Cloud)

### Deploy to Vercel (Fastest):
1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the 4 environment variables from your `.env` file.
4. Click **Deploy**!

### Deploy on VPS with PM2 & Nginx:
```bash
npm run build
npm install -g pm2
pm2 start npm --name "movies-frontend" -- start -- -p 3001
```

---

## ⌨️ Keyboard Controls (Watch Player)

| Key | Action |
| :--- | :--- |
| `Space` / `K` | Play / Pause |
| `Left Arrow` / `J` | Rewind 10 seconds |
| `Right Arrow` / `L` | Skip forward 10 seconds |
| `M` | Mute / Unmute |
| `F` | Toggle Fullscreen |
| `P` / `N` | Previous / Next Episode (Series) |
| `?` | Keyboard Shortcuts Guide |

---

## ⚖️ License & Legal Disclaimer

* **License**: MIT License. Free to use, modify, and distribute with attribution.
* **Disclaimer**: Movies.snishad does not host any media files on its servers. All videos and stream embeds are hosted on third-party public internet services.

---

Crafted with care by **SNishad** ([@snishad.me_](https://instagram.com/snishad.me_)).

# Movies.snishad — Core Streaming Backend & API Engine 🎬⚡

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-5A67D8.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-rose.svg)](LICENSE)

An ultra-fast, open-source streaming backend and API engine for movies and web series. Built with **Next.js 14**, **Prisma ORM**, and **MySQL**. Features automated TMDB live sync with hourly refreshing, real-time multi-server health verification, zero-exposure security, and high-speed direct download proxying.

---

## 👨‍💻 Developer & Credits

Architected, developed, and maintained by **SNishad**:
* **Instagram**: [@snishad.me_](https://instagram.com/snishad.me_)
* **Email**: [snishad01985@gmail.com](mailto:snishad01985@gmail.com)

### 🐛 Bug Reporting & Feedback
> **Community Notice**: If you find any bugs or issues, please report them to me on Instagram (**[@snishad.me_](https://instagram.com/snishad.me_)**). I know it may have bugs, but I don't know everything — your bug reports, feedback, and pull requests are warmly welcome to help make this platform better!

### 💼 Custom Website Development at Affordable Prices
> **Need a custom website?** Want your own movie streaming site, web app, e-commerce store, or portfolio built at an **affordable price**?  
> Connect with me directly on Instagram (**[@snishad.me_](https://instagram.com/snishad.me_)**) or send an email to **snishad01985@gmail.com**!

---

## 🌟 Key Highlights

* **1-Hour Fresh Trending Cache**: Refreshes TMDB trending and cinema catalogs every single hour automatically for the latest hits, while serving sub-5ms cached responses.
* **Smart Streaming Server Discovery**: Pings upstream embed mirrors with fast timeouts and numbers working servers as `Server 1`, `Server 2`, etc.
* **Zero-Exposure Security**: Database URLs, SMTP credentials, and admin tokens are strictly isolated on the server and never exposed to client browsers.
* **Single `.env` Configuration**: No confusing multi-file env setups — just one single `.env` file to configure everything.
* **Direct Cloud Downloader Proxy**: Powered by `02moviedownloader.top` for direct one-click downloads in 1080p, 720p, and 480p.

---

## 🚀 Super Easy 3-Step Setup (Anyone Can Deploy)

### Step 1: Install Dependencies
Make sure you have [Node.js 18+](https://nodejs.org/) and MySQL (e.g. XAMPP) installed.

```bash
git clone https://github.com/s-nishad-up/Movieapi.git backend
cd backend
npm install
```

### Step 2: Configure `.env`
Copy the example configuration to create your single `.env` file:

```bash
cp .env.example .env
```

Open `.env` in any text editor and set your database and TMDB key:
```env
# Your MySQL connection string
DATABASE_URL="mysql://root:@localhost:3306/movies_snishad"

# Free TMDB API Key from https://www.themoviedb.org/settings/api
TMDB_API_KEY="your-tmdb-api-key"

# Secret key for security (any random string)
INTERNAL_API_KEY="movies-snishad-secure-internal-token-2026"
JWT_SECRET="movies-snishad-super-secret-jwt-key-min-32-chars-2026"
```

Sync the database tables with one simple command:
```bash
npx prisma db push
```

### Step 3: Run the Server
```bash
npm run dev
```
The backend API is now live on **`http://localhost:3000`**!

---

## 🌐 Production Deployment (1-Click or VPS)

### Production Build & Run with PM2:
```bash
npm run build
npm install -g pm2
pm2 start npm --name "movies-backend" -- start -- -p 3000
```

### Deploy to Cloud (Railway / Render / VPS):
1. Create a MySQL database (e.g. on Railway, PlanetScale, or VPS).
2. Set your environment variables in the cloud dashboard.
3. Build command: `npm install && npx prisma db push && npm run build`
4. Start command: `npm start`

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/settings` | `GET` | Site theme, developer details, and public configs |
| `/api/homepage` | `GET` | Curated rows and hourly-refreshed trending cinema |
| `/api/trending` | `GET` | Comprehensive Top 50 trending movies & series |
| `/api/movies` | `GET` | Filtered movies catalog (Bollywood, Hollywood, South, Old) |
| `/api/movies/[slug]` | `GET` | Single movie metadata, streams, cast, and download links |
| `/api/series` | `GET` | Series catalog with seasons and episode trees |
| `/api/search?q={query}` | `GET` | Fast instant search across local DB and TMDB |
| `/api/watch/servers` | `GET` | Health checks and returns working streaming servers |

---

## ⚖️ License & Disclaimer

* **License**: MIT License. Free to use and distribute with attribution.
* **Disclaimer**: This project is for personal educational and indexing purposes. No video media is hosted on these servers; all streams are embedded from public third-party services.

---

Crafted with care by **SNishad** ([@snishad.me_](https://instagram.com/snishad.me_)).
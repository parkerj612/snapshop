# SnapShop — Scan · Compare · Buy

A mobile-first product scanner that uses **Google Cloud Vision AI** to identify products from your phone's camera and **Claude AI** to search the web for real-time pricing across retailers.

## How It Works

1. **Scan** — Point your camera at any product. Google Vision identifies it using label detection, logo detection, object localization, and web detection.
2. **Compare** — Claude searches the web in real-time for current prices across Amazon, Best Buy, Walmart, Target, and more.
3. **Buy** — Tap "Buy Now" to purchase through affiliate links. SnapShop earns commission at zero cost to the user.

## Tech Stack

- **Frontend:** React + Vite
- **AI Vision:** Google Cloud Vision API
- **AI Search:** Claude API (Sonnet) with web search
- **Hosting:** Vercel

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/snapshop.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `snapshop` repository
4. Framework preset will auto-detect as **Vite**
5. Click **Deploy**

That's it — you'll get an HTTPS URL like `snapshop-xyz.vercel.app` where the camera will work.

### 3. Configure API Keys

- **Google Cloud Vision:** Enter your key in the app's setup screen on first launch. Get one at [console.cloud.google.com](https://console.cloud.google.com) → enable Cloud Vision API → create API key.
- **Claude API:** Already configured to use the Anthropic API. Works automatically when hosted.

## Local Development

```bash
npm install
npm run dev
```

Open `https://localhost:3000` (camera requires HTTPS — Vite provides this in dev mode).

## Monetization

All revenue flows to the platform:

- **Affiliate commissions** — Every "Buy Now" link is tagged with SnapShop's affiliate IDs
- **Premium tier** ($4.99/mo) — Unlimited scans, price alerts, price history (future)
- **Promoted listings** — Retailers pay for placement (future)

## Project Structure

```
snapshop/
├── index.html              # Entry point
├── package.json
├── vite.config.js
├── vercel.json             # SPA routing
├── src/
│   ├── main.jsx            # React mount
│   ├── App.jsx             # Main app + routing
│   ├── styles.css          # Global styles + animations
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Particles.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ScannerOverlay.jsx
│   │   └── SetupScreen.jsx
│   └── services/
│       ├── search.js       # Claude API product search
│       ├── storage.js      # localStorage wrapper
│       └── vision.js       # Google Vision API
```

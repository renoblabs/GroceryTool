# 🛒 Grocery Price Optimizer

**Find the best grocery deals across Ontario stores in seconds!**

Compare real-time prices across No Frills, Food Basics, Walmart, and Costco. Import your shopping list, get instant price comparisons, and optimize your grocery shopping to save money.

## ✨ Features

### 📋 Smart List Management
* **Multi-format import**: CSV, JSON, plain text, or Google Sheets
* **Intelligent parsing**: Automatically extracts quantities, units, and notes
* **Persistent storage**: Save and manage multiple shopping lists

### 💰 Price Comparison
* **Multi-store comparison**: No Frills, Food Basics, Walmart, Costco
* **Smart recommendations**: See which store is cheapest for each item
* **Unit price normalization**: Compare $/kg, $/L, $/ea fairly across products
* **Store totals**: Get total cost breakdown by store

### 🔐 Secure & Private
* **Magic-link authentication**: No passwords required
* **Row-level security**: Your data is private and secure
* **Demo mode**: Try the app without signing up

### 🎯 Coming Soon
* **Live price scraping**: Real-time data via ScrapingBee API
* **Voice input**: Add items by speaking (Web Speech + Whisper)
* **Cart integration**: Pre-fill Walmart & PC Express carts
* **AI matching**: Smart product matching using embeddings

## Tech Stack
* Next.js (App Router, TypeScript) — deployed on Vercel
* Supabase (Postgres, Auth, Storage, pgvector)
* ScrapingBee (server-side scraping proxy)
* React / Tailwind-free custom CSS
* Zod, PapaParse

## 🚀 Quick Start

### Try Demo Mode (No Setup Required!)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start using the app right away! Demo mode uses local storage and sample data.

### Production Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```
3. **Run database migrations** (see [docs/SETUP.md](docs/SETUP.md))
4. **Start the application**:
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [**Setup Guide**](docs/SETUP.md).

## 🔧 Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes* | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Supabase service role key (server-only) |
| `SCRAPINGBEE_API_KEY` | No | ScrapingBee API key for live prices |
| `DEFAULT_POSTAL_CODE` | No | Default postal code (default: L3K 1V8) |
| `COSTCO_MEMBER` | No | Set to 1 if Costco member (default: 1) |

*Not required for demo mode

## Database

1. Open Supabase SQL editor  
2. Run `supabase/migrations/0001_schema.sql` then `0002_policies.sql`  
3. Verify `Row Level Security` is **ON** for `lists`, `list_items`, `locations`

Migrations set up canonical catalog, store tables, and price history.

## Deploy to Vercel (high-level)

1. Push code to GitHub
2. In Vercel → “New Project”  
   • Link GitHub repo  
   • Framework preset: **Next.js**  
   • Set env vars (same as `.env.local`, omit service key on preview)  
3. Deploy → Vercel will handle builds; Supabase URL stays the same.

## ScrapingBee Plug-in

Server routes call `fetchWithScrapingBee()` wrapper (see `lib/scraping`).  
Add store-specific parsers in `app/api/price/*`.  
Free tier = 1 000 requests/mo; set caching to avoid overage.

## Roadmap
- [ ] Implement HTML/JSON parsers for each store
- [ ] Cache price results (12-24 h) via Supabase Storage/Edge
- [ ] Confirmation screen for low-confidence product matches
- [ ] Voice capture + entity parser
- [ ] Cart automation actors (Apify) behind feature flag
- [ ] Mobile PWA optimizations
- [ ] Tests & CI

## License
MIT © 2025 Your Name

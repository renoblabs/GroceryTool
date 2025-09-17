# Grocery Price Optimizer MVP

Compare real-time grocery prices across No Frills, Food Basics, Walmart, and Costco (ON, Canada).  
Import a list, check which store is cheapest for each item, and get store-specific sub-lists.

## Features
* Import grocery list (CSV / JSON / plain text / Google Sheets)
* Supabase Auth (magic-link)
* View & manage lists
* Price check across selected stores (mock data → ScrapingBee adapter WIP)
* Unit normalization ($/kg, $/L, $/ea)
* Row-level-secure Postgres schema (canonical products, store SKUs, pricing history)

### Work-in-Progress
* Live scraping via ScrapingBee
* Voice input (Web Speech → Whisper fallback)
* Cart pre-fill for Walmart & PC Express
* Embedding-based product matching (pgvector)

## Tech Stack
* Next.js (App Router, TypeScript) — deployed on Vercel
* Supabase (Postgres, Auth, Storage, pgvector)
* ScrapingBee (server-side scraping proxy)
* React / Tailwind-free custom CSS
* Zod, PapaParse

## Getting Started

### Prerequisites
1. Node 18+
2. Supabase project
3. ScrapingBee API key (free 1 000 req/mo)
4. (Optional) Vercel account

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** service role key |
| `SCRAPINGBEE_API_KEY` | ScrapingBee key |
| `DEFAULT_POSTAL_CODE` | e.g. `L3K 1V8` |
| `COSTCO_MEMBER` | `1` if member, else `0` |
| `OPENROUTER_API_KEY` | LLM calls (server-only) |

Store secrets (.env.local) are git-ignored.

### Install & run (local)

```bash
git clone <repo-url>
cd grocerytool
cp .env.local.example .env.local      # fill in vars
npm install
npm run dev                           # http://localhost:3000
```

### Build & start

```bash
npm run build
npm start
```

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

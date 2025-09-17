# Architecture Overview

## 1. High-Level Diagram (textual)

```
[Browser]
   │  (fetch / React)
   ▼
[Next.js Frontend] — pages & client hooks
   │
   ├──►  /api/lists/*        (CRUD lists)
   ├──►  /api/price/run      (orchestrates price check)
   └──►  /api/store/*        (store-specific helpers)
        │
        ▼
[Supabase Postgres + Auth]   (lists, catalog, prices)
        │
        ▼
[ScrapingBee Proxy] ──► Target Store Websites
```

Frontend & API routes run on Vercel.  
Supabase holds state and enforces RLS.  
ScrapingBee adds IP rotation + JS render for scraping.

---

## 2. Data Model Summary

• `users` (via Supabase Auth)  
• `lists` — one row per grocery list (`user_id`, `name`, `created_at`)  
• `list_items` — parsed items linked to a list (`raw_text`, qty/unit, optional `canonical_product_id`)  
• `canonical_products` — global catalog entry (name, brand, category, default_unit)  
• `store_products` — SKU at a given store (`store_id`, `store_sku`, `product_id?`)  
• `prices` — time-series price quotes (`store_product_id`, price, fetched_at)  
• `latest_prices` view — fast lookup of current price per SKU  
• `product_matches` — mapping table with confidence between store SKU and canonical product  
• `stores` & `store_locations` — metadata

---

## 3. Price-Run Flow (POST /api/price/run)

1. Client sends `{ list_id, selectedStores, postalCode }` with bearer token.  
2. API verifies Supabase JWT, fetches list & items (RLS via service key).  
3. For **each item** and **each selected store**:  
   a. Call store adapter (→ ScrapingBee) to fetch HTML/JSON.  
   b. Parse first n results → extract `name, size, price`.  
   c. Normalize unit price; return best match.  
4. Choose `best_store` per item by lowest unit/total price.  
5. Return results to client and (async) upsert `store_products` + `prices`.  
6. Client renders comparison + store-split list.

---

## 4. Store Adapter Pattern

* Location-aware search URL (postal code or storeId).  
* `fetchWithScrapingBee(url, { render_js, country_code: 'ca' })`.  
* Cheerio / regex parse function per store → `{price, unitQty, unit, url}`.  
* `matchOrInsertSKU()` util:  
  - If `store_sku` exists → reuse id.  
  - Else insert into `store_products`.  
* Return normalized `StorePrice` object to orchestrator.

Adapters live in `lib/adapters/{store}.ts` and share helper utilities.

---

## 5. Security & RLS

* Supabase **Row Level Security**:  
  - `lists`, `list_items`, `locations` restricted to `auth.uid()`.  
  - Catalog / price tables **read-only** for auth users; writes via service role on server.  
* Service role key loaded **only** in server context (`process.env.SUPABASE_SERVICE_ROLE_KEY`).  
* `.env.local` is git-ignored; never expose private keys in client bundle.  
* ScrapingBee key likewise server-only.  
* All external calls routed through Vercel API to avoid CORS/secret leaks.

---

## 6. Next Steps

- Implement real parsers per store & caching layer.  
- Add background job (CRON on Vercel or Supabase Functions) to refresh prices nightly.  
- Introduce embeddings (pgvector) for fuzzy product matching after initial manual confirm UI.  
- Harden adapters with CAPTCHAs / anti-bot fallback (delay, rotate headers).

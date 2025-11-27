# GroceryTool Setup Guide

## Quick Start (5 minutes to get running)

### Step 1: Set up Supabase Database (2 minutes)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub/Google (fastest)
   - Click "New Project"

2. **Create Your Project**
   - Organization: Choose your personal org
   - Name: "GroceryTool" 
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project" (takes ~2 minutes)

3. **Get Your Credentials**
   - Once project is ready, go to Settings → API
   - Copy these 3 values:
     - **Project URL**: `https://abcdefghijklmnop.supabase.co`
     - **anon public key**: `eyJ...` (long string)
     - **service_role key**: `eyJ...` (different long string)

4. **Set Up Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase/migrations/0001_schema.sql`
   - Click "Run" to create all tables

### Step 2: Configure Environment (30 seconds)

1. **Update `.env.local`** with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...

# Optional: For real scraping (see Step 4)
SCRAPINGBEE_API_KEY=your-scrapingbee-key
```

### Step 3: Start the App (30 seconds)

```bash
npm install
npm run setup-db  # Populates sample data
npm run dev
```

Visit: http://localhost:3000

### Step 4: Add Your Grocery List

1. **Sign Up**: Create account in the app (uses Supabase Auth)
2. **Import Your List**: 
   - Go to "Import" page
   - Paste your grocery list (one item per line)
   - Examples:
     ```
     bananas 2 kg
     milk 2% 1L
     ground beef 500g
     eggs large 1 dozen
     bread whole wheat 1 loaf
     ```
3. **Run Price Check**: Select stores and click "Run Price Check"

## For Real Price Scraping (Optional)

### ScrapingBee Setup (1 minute)
1. Go to [scrapingbee.com](https://scrapingbee.com)
2. Sign up (free tier: 1,000 requests/month)
3. Get API key from dashboard
4. Add to `.env.local`: `SCRAPINGBEE_API_KEY=your-key`

**Without ScrapingBee**: App uses realistic demo data (perfect for testing)
**With ScrapingBee**: Gets real prices from No Frills, Food Basics, Walmart, Costco

## Your Grocery List Format

The app is smart about parsing. These all work:

```
# Simple format
bananas
milk
bread

# With quantities
bananas 2 kg
milk 1L
ground beef 500g
eggs 1 dozen

# With brands/details
President's Choice milk 2% 1L
Wonder bread white 1 loaf
Coca-Cola 2L bottle
```

## Supported Stores

✅ **No Frills** (Loblaws)
✅ **Food Basics** (Metro)  
✅ **Walmart Canada**
✅ **Costco Canada**

## Troubleshooting

### Database Connection Issues
```bash
# Test your connection
npm run setup-db
```
If this fails, double-check your Supabase credentials in `.env.local`

### App Won't Start
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### No Prices Showing
- **Without ScrapingBee**: Should show demo prices
- **With ScrapingBee**: Check API key and request limits

## Advanced Features

### Bulk Import
- Paste 25+ items at once
- App automatically parses quantities and units
- Handles common grocery list formats

### Price Optimization
- Shows total cost per store
- Recommends optimal shopping strategy
- Identifies best deals per item

### Store Selection
- Toggle stores on/off
- Compare 2-4 stores simultaneously
- Save preferred store combinations

## File Structure
```
GroceryTool/
├── .env.local              # Your credentials (don't commit!)
├── supabase/
│   └── migrations/         # Database schema
├── lib/adapters/           # Store scrapers
├── app/                    # Next.js app
└── scripts/
    ├── setup-db.js         # Database setup
    └── demo-scraping.js    # Test scrapers
```

## Next Steps

1. **Set up Supabase** (required)
2. **Start the app** with `npm run dev`
3. **Add your grocery list** through the Import page
4. **Optional**: Add ScrapingBee for real prices
5. **Start saving money!** 💰

## Support

- Check the demo at: http://localhost:3000
- All store adapters have fallback demo data
- Database schema is in `supabase/migrations/0001_schema.sql`
- Environment template is in `.env.local`

---

**Total setup time: ~5 minutes**
**Your grocery list ready: Immediately after setup**
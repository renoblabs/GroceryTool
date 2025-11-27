# GroceryTool - Full Stack Deployment Guide

## 🚀 Deploy to Vercel + Supabase (10 minutes)

### Step 1: Set up Supabase Backend (3 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) → Sign up → New Project
   - Name: "GroceryTool"
   - Generate strong password (save it!)
   - Choose region closest to you
   - Click "Create new project" (takes ~2 minutes)

2. **Set up Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy the entire contents of `supabase/migrations/0001_schema.sql`
   - Paste and click "Run" to create all tables

3. **Get Your Credentials** (Settings → API)
   - **Project URL**: `https://abcdefghijklmnop.supabase.co`
   - **anon public key**: `eyJ...` (long string)
   - **service_role key**: `eyJ...` (different long string)

### Step 2: Deploy to Vercel (5 minutes)

1. **Push to GitHub**
   ```bash
   # In your GroceryTool directory
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) → Sign up with GitHub
   - Click "New Project" → Import your GroceryTool repository
   - Framework Preset: **Next.js** (auto-detected)
   - Click "Deploy"

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add these 3 variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...your-anon-key...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...your-service-role-key...
   ```

4. **Optional: Add ScrapingBee for Real Prices**
   ```
   SCRAPINGBEE_API_KEY = your-scrapingbee-api-key
   ```

5. **Redeploy**
   - Go to Deployments tab → Click "..." → Redeploy
   - Your app will be live at: `https://your-app.vercel.app`

### Step 3: Initialize Database (1 minute)

1. **Populate Sample Data**
   - Run locally: `npm run setup-db` (uses your production Supabase)
   - Or manually insert data through Supabase dashboard

### Step 4: Test Your Live App

1. **Visit Your App**: `https://your-app.vercel.app`
2. **Sign Up**: Create account (Supabase Auth)
3. **Import List**: Add your 25 grocery items
4. **Run Price Check**: See live price comparisons!

## 🎯 What You Get

### Frontend (Vercel)
- ✅ **Global CDN** - Fast worldwide
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **HTTPS** - Secure by default
- ✅ **Custom domain** - Optional
- ✅ **Git integration** - Auto-deploy on push

### Backend (Supabase)
- ✅ **PostgreSQL database** - Fully managed
- ✅ **Authentication** - Built-in user system
- ✅ **Real-time** - Live updates
- ✅ **API** - Auto-generated REST/GraphQL
- ✅ **Storage** - File uploads (if needed)

### Features
- ✅ **Multi-store price comparison**
- ✅ **Smart grocery list parsing**
- ✅ **Optimized shopping recommendations**
- ✅ **User accounts & saved lists**
- ✅ **Mobile responsive**

## 🔧 Configuration Files

### `vercel.json` (Optional - for advanced config)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables Summary
```bash
# Production (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SCRAPINGBEE_API_KEY=your-key  # Optional

# Local Development (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SCRAPINGBEE_API_KEY=your-key  # Optional
```

## 🚀 Deployment Workflow

### Initial Deploy
1. Set up Supabase
2. Push to GitHub
3. Deploy on Vercel
4. Add environment variables
5. Initialize database

### Future Updates
1. Make changes locally
2. Test with `npm run dev`
3. Push to GitHub
4. Vercel auto-deploys!

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)
- Page views, performance metrics
- Enable in Vercel dashboard

### Supabase Analytics (Built-in)
- Database usage, API calls
- User authentication metrics

## 🔒 Security Features

### Supabase
- Row Level Security (RLS) enabled
- JWT-based authentication
- API rate limiting

### Vercel
- HTTPS everywhere
- DDoS protection
- Edge caching

## 💰 Pricing (Free Tiers)

### Vercel (Hobby Plan - Free)
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ Automatic HTTPS

### Supabase (Free Tier)
- ✅ 500MB database
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth
- ✅ 50MB file storage

### ScrapingBee (Free Tier)
- ✅ 1,000 API calls/month
- ✅ JavaScript rendering
- ✅ Proxy rotation

## 🎯 Your Live App Features

1. **User Registration/Login**
2. **Import grocery lists** (paste 25+ items)
3. **Multi-store price comparison**
4. **Savings optimization**
5. **Mobile-friendly interface**
6. **Real-time price updates**

## 🔧 Troubleshooting

### Build Fails on Vercel
- Check environment variables are set
- Ensure all dependencies in package.json

### Database Connection Issues
- Verify Supabase credentials
- Check database is running (not paused)

### Scraping Issues
- ScrapingBee API key correct?
- Check monthly usage limits
- Demo data works without API key

## 🎉 Success!

Your GroceryTool is now a **full-stack production app**:
- **Frontend**: Vercel (global CDN)
- **Backend**: Supabase (managed database)
- **Features**: Price comparison across 4 major stores
- **Scale**: Ready for thousands of users

**Total setup time: ~10 minutes**
**Your grocery list ready: Immediately after deployment**

---

## Quick Commands Reference

```bash
# Local development
npm run dev
npm run setup-db
npm run test-my-list

# Deployment
git add .
git commit -m "Deploy to production"
git push origin main
# Vercel auto-deploys!
```
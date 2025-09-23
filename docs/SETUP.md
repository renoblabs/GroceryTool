# Setup Guide

This guide helps you set up the Grocery Price Optimizer with your own Supabase backend.

## Quick Start (Demo Mode)

The application works out of the box in demo mode! Just run:

```bash
npm install
npm run dev
```

Demo mode uses local storage and sample price data, perfect for testing and development.

## Production Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Copy your project URL and anon key from Settings > API

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (from Settings > API)

Optional variables:
- `SCRAPINGBEE_API_KEY` - For live price scraping (get free key at scrapingbee.com)
- `DEFAULT_POSTAL_CODE` - Default postal code for store searches (default: L3K 1V8)
- `COSTCO_MEMBER` - Set to 1 if you have Costco membership (default: 1)
- `OPENROUTER_API_KEY` - For future AI features

### 3. Set Up Database Schema

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_policies.sql`
4. Verify that Row Level Security (RLS) is enabled for user tables

### 4. Configure Authentication

1. In Supabase Dashboard, go to Authentication > Settings
2. Enable "Enable email confirmations" if you want email verification
3. Configure your site URL in "Site URL" setting
4. Set up email templates if desired

### 5. Run the Application

```bash
npm run dev
```

Your application will now use real Supabase data instead of demo mode!

## Optional Enhancements

### ScrapingBee Integration

For real-time price scraping:

1. Get a free API key from [ScrapingBee](https://www.scrapingbee.com) (1,000 requests/month free)
2. Add `SCRAPINGBEE_API_KEY` to your `.env.local`
3. Implement store-specific parsers in `app/api/price/*` routes

### Deployment

#### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

#### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Docker

## Store Coverage

Currently configured for Ontario, Canada stores:
- No Frills
- Food Basics
- Walmart
- Costco

To add more stores:
1. Add store entries to `supabase/migrations/0001_schema.sql`
2. Create API parsers in `app/api/price/[store]/route.ts`
3. Update the UI to include the new stores

## Troubleshooting

### Database Issues
- Ensure RLS policies are set up correctly
- Check that service role key has proper permissions
- Verify table structure matches the schema

### Authentication Issues
- Check Supabase auth settings
- Verify site URL is correctly configured
- Ensure email provider is set up (for magic links)

### API Issues
- Check environment variables are loaded
- Verify ScrapingBee API key is valid
- Monitor API rate limits

## Development

### Database Changes
1. Create new migration files in `supabase/migrations/`
2. Use numbered prefixes (0003_, 0004_, etc.)
3. Test locally before applying to production

### Adding Store Integrations
1. Study store's website structure
2. Create scraping logic in `lib/scraping/[store].ts`
3. Add API endpoint in `app/api/price/[store]/route.ts`
4. Update unit tests

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- Check the [README](../README.md) for basic usage
- Review this setup guide for configuration issues
- Open an issue on GitHub for bugs or feature requests
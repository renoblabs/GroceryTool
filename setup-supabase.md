# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: "GroceryTool" (or your preferred name)
   - Database Password: Generate a strong password and save it
   - Region: Choose closest to your location
5. Click "Create new project"

## Step 2: Get Your Project Credentials

Once your project is created:

1. Go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Update Environment Variables

Update your `.env.local` file with the values from Step 2:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

## Step 4: Run Database Migrations

After updating your environment variables, run the database setup:

```bash
npm run setup-db
```

This will create all the necessary tables and insert sample data.

## Step 5: Test the Connection

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000 to see if the app loads correctly.

## Optional: ScrapingBee Setup

For real price scraping (instead of demo data):

1. Sign up at [scrapingbee.com](https://www.scrapingbee.com)
2. Get your API key from the dashboard
3. Add it to `.env.local`:
   ```bash
   SCRAPINGBEE_API_KEY=your-scrapingbee-api-key
   ```

Without ScrapingBee, the app will use realistic demo data for testing.
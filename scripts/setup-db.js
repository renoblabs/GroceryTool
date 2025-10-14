#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please update your .env.local file with your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up GroceryTool database...');

  try {
    // Test connection
    const { data, error } = await supabase.from('stores').select('count');
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      console.error('Please check your environment variables and ensure your database is set up');
      process.exit(1);
    }

    console.log('✅ Connected to Supabase successfully');

    // Insert sample brands
    console.log('📦 Adding sample brands...');
    const brands = [
      { name: 'President\'s Choice' },
      { name: 'No Name' },
      { name: 'Coca-Cola' },
      { name: 'Pepsi' },
      { name: 'Kraft' },
      { name: 'Heinz' },
      { name: 'Campbell\'s' },
      { name: 'Kellogg\'s' },
      { name: 'General Mills' },
      { name: 'Quaker' },
      { name: 'Dole' },
      { name: 'Del Monte' },
      { name: 'Tropicana' },
      { name: 'Minute Maid' },
      { name: 'Wonder' }
    ];

    const { error: brandsError } = await supabase
      .from('brands')
      .upsert(brands, { onConflict: 'name' });

    if (brandsError) {
      console.error('❌ Error inserting brands:', brandsError.message);
    } else {
      console.log(`✅ Added ${brands.length} brands`);
    }

    // Insert sample categories
    console.log('🏷️ Adding sample categories...');
    const categories = [
      { name: 'Produce' },
      { name: 'Dairy & Eggs' },
      { name: 'Meat & Seafood' },
      { name: 'Bakery' },
      { name: 'Pantry' },
      { name: 'Beverages' },
      { name: 'Frozen' },
      { name: 'Snacks' },
      { name: 'Health & Beauty' },
      { name: 'Household' }
    ];

    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' })
      .select();

    if (categoriesError) {
      console.error('❌ Error inserting categories:', categoriesError.message);
    } else {
      console.log(`✅ Added ${categories.length} categories`);
    }

    // Get inserted brands and categories for reference
    const { data: allBrands } = await supabase.from('brands').select('*');
    const { data: allCategories } = await supabase.from('categories').select('*');

    // Insert sample canonical products
    console.log('🛒 Adding sample products...');
    const products = [
      {
        name: 'Bananas',
        brand_id: null,
        category_id: allCategories?.find(c => c.name === 'Produce')?.id,
        default_unit: 'kg'
      },
      {
        name: 'Milk 2%',
        brand_id: allBrands?.find(b => b.name === 'President\'s Choice')?.id,
        category_id: allCategories?.find(c => c.name === 'Dairy & Eggs')?.id,
        default_unit: 'l'
      },
      {
        name: 'White Bread',
        brand_id: allBrands?.find(b => b.name === 'Wonder')?.id,
        category_id: allCategories?.find(c => c.name === 'Bakery')?.id,
        default_unit: 'ea'
      },
      {
        name: 'Ground Beef',
        brand_id: null,
        category_id: allCategories?.find(c => c.name === 'Meat & Seafood')?.id,
        default_unit: 'kg'
      },
      {
        name: 'Coca-Cola',
        brand_id: allBrands?.find(b => b.name === 'Coca-Cola')?.id,
        category_id: allCategories?.find(c => c.name === 'Beverages')?.id,
        default_unit: 'l'
      },
      {
        name: 'Eggs Large',
        brand_id: null,
        category_id: allCategories?.find(c => c.name === 'Dairy & Eggs')?.id,
        default_unit: 'dozen'
      },
      {
        name: 'Chicken Breast',
        brand_id: null,
        category_id: allCategories?.find(c => c.name === 'Meat & Seafood')?.id,
        default_unit: 'kg'
      },
      {
        name: 'Apples Red Delicious',
        brand_id: null,
        category_id: allCategories?.find(c => c.name === 'Produce')?.id,
        default_unit: 'kg'
      },
      {
        name: 'Orange Juice',
        brand_id: allBrands?.find(b => b.name === 'Tropicana')?.id,
        category_id: allCategories?.find(c => c.name === 'Beverages')?.id,
        default_unit: 'l'
      },
      {
        name: 'Pasta Spaghetti',
        brand_id: allBrands?.find(b => b.name === 'President\'s Choice')?.id,
        category_id: allCategories?.find(c => c.name === 'Pantry')?.id,
        default_unit: 'g'
      }
    ];

    const { data: insertedProducts, error: productsError } = await supabase
      .from('canonical_products')
      .upsert(products)
      .select();

    if (productsError) {
      console.error('❌ Error inserting products:', productsError.message);
    } else {
      console.log(`✅ Added ${products.length} canonical products`);
    }

    // Create a sample user list (this would normally be done through the UI)
    console.log('📝 Creating sample grocery list...');
    
    // First, let's check if we have any users (in a real app, this would be handled differently)
    console.log('ℹ️  Note: To create sample lists, you\'ll need to sign up a user through the app first');
    console.log('ℹ️  The database is now ready with sample products and stores');

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Sign up for an account');
    console.log('4. Create a grocery list and test price scraping');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
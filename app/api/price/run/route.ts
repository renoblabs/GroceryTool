import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabaseAdmin';
import { searchNoFrills as searchNoFrillsAdapter } from '@/lib/adapters/nofrills';
import { searchFoodBasics as searchFoodBasicsAdapter } from '@/lib/adapters/foodbasics';
import { searchWalmart as searchWalmartAdapter } from '@/lib/adapters/walmart';
import { searchCostco as searchCostcoAdapter } from '@/lib/adapters/costco';

type PriceRunRequest = {
  list_id: string;
  stores: {
    nofrills?: boolean;
    foodbasics?: boolean;
    walmart?: boolean;
    costco?: boolean;
  };
  postal?: string;
};

type StorePrice = {
  price: number;
  unit_price?: number;
  available: boolean;
  product_name?: string;
  size?: string;
  url?: string;
};

type PriceResult = {
  item_id: string;
  raw_text: string;
  nofrills?: StorePrice;
  foodbasics?: StorePrice;
  walmart?: StorePrice;
  costco?: StorePrice;
  best_store: 'nofrills' | 'foodbasics' | 'walmart' | 'costco';
};

type ListItem = {
  id: string;
  raw_text: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  try {
    // Get and validate authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    // Create a temporary client to verify the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Parse request body
    const { list_id, stores, postal = process.env.DEFAULT_POSTAL_CODE || 'L3K 1V8' }: PriceRunRequest = await req.json();

    // Validate required fields
    if (!list_id) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    if (!stores || Object.values(stores).filter(Boolean).length === 0) {
      return NextResponse.json(
        { error: 'At least one store must be selected' },
        { status: 400 }
      );
    }

    // Get admin client to bypass RLS
    const adminClient = getAdminClient();

    // Fetch list and items
    const { data: list, error: listError } = await adminClient
      .from('lists')
      .select('*')
      .eq('id', list_id)
      .eq('user_id', user.id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: listError?.message || 'List not found' },
        { status: 404 }
      );
    }

    const { data: items, error: itemsError } = await adminClient
      .from('list_items')
      .select('*')
      .eq('list_id', list_id)
      .order('created_at', { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message || 'Failed to fetch list items' },
        { status: 500 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'List has no items' },
        { status: 400 }
      );
    }

    // Process each item and get prices from selected stores
    const priceResults: PriceResult[] = await Promise.all(
      items.map(async (item: ListItem) => {
        const result: Partial<PriceResult> = {
          item_id: item.id,
          raw_text: item.raw_text,
        };

        // Get prices from selected stores
        if (stores.nofrills) {
          result.nofrills = await searchNoFrills(item, postal);
        }

        if (stores.foodbasics) {
          result.foodbasics = await searchFoodBasics(item, postal);
        }

        if (stores.walmart) {
          result.walmart = await searchWalmart(item, postal);
        }

        if (stores.costco) {
          result.costco = await searchCostco(item, postal);
        }

        // Determine best store based on unit price or regular price
        let bestStore: 'nofrills' | 'foodbasics' | 'walmart' | 'costco' = 'walmart'; // Default
        let bestPrice = Infinity;

        if (result.nofrills?.available && result.nofrills.price < bestPrice) {
          bestPrice = result.nofrills.price;
          bestStore = 'nofrills';
        }

        if (result.foodbasics?.available && result.foodbasics.price < bestPrice) {
          bestPrice = result.foodbasics.price;
          bestStore = 'foodbasics';
        }

        if (result.walmart?.available && result.walmart.price < bestPrice) {
          bestPrice = result.walmart.price;
          bestStore = 'walmart';
        }

        if (result.costco?.available && result.costco.price < bestPrice) {
          bestPrice = result.costco.price;
          bestStore = 'costco';
        }

        result.best_store = bestStore;

        // Store results in database (placeholder for future implementation)
        // This would write to store_products and prices tables
        // await storeProductsAndPrices(item, result, adminClient);

        return result as PriceResult;
      })
    );

    return NextResponse.json({ items: priceResults });
  } catch (err: any) {
    console.error('Error in price/run route:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function searchNoFrills(item: ListItem, postal: string): Promise<StorePrice> {
  return searchNoFrillsAdapter(item, postal);
}

async function searchFoodBasics(item: ListItem, postal: string): Promise<StorePrice> {
  return searchFoodBasicsAdapter(item, postal);
}

async function searchWalmart(item: ListItem, postal: string): Promise<StorePrice> {
  return searchWalmartAdapter(item, postal);
}

async function searchCostco(item: ListItem, postal: string): Promise<StorePrice> {
  return searchCostcoAdapter(item, postal);
}

// Function to store products and prices (placeholder for future implementation)
/*
async function storeProductsAndPrices(
  item: ListItem, 
  result: PriceResult, 
  adminClient: any
) {
  // For each store with available products:
  // 1. Upsert to store_products table
  // 2. Insert to prices table
  // 3. Try to match with canonical_products
  // 4. Update product_matches if confidence is high
  
  const stores = ['nofrills', 'foodbasics', 'walmart', 'costco'] as const;
  
  for (const store of stores) {
    const storeData = result[store];
    if (!storeData || !storeData.available) continue;
    
    // This would upsert to store_products and insert to prices
    // Also would attempt to match with canonical_products
  }
}
*/

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabaseAdmin';

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

// Store adapter functions - these will eventually use ScrapingBee to fetch real data

async function searchNoFrills(item: ListItem, postal: string): Promise<StorePrice> {
  // This would use ScrapingBee to search No Frills website
  // const apiKey = process.env.SCRAPINGBEE_API_KEY;
  // const url = `https://www.nofrills.ca/api/v2/products/search?q=${encodeURIComponent(item.raw_text)}`;
  
  // For MVP, return mock data
  const price = (Math.random() * 10 + 1).toFixed(2) * 1;
  const unitPrice = (Math.random() * 2 + 0.5).toFixed(2) * 1;
  
  return {
    price,
    unit_price: unitPrice,
    available: Math.random() > 0.1,
    product_name: `No Frills ${item.raw_text}`,
    size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
    url: `https://www.nofrills.ca/search?query=${encodeURIComponent(item.raw_text)}`,
  };
}

async function searchFoodBasics(item: ListItem, postal: string): Promise<StorePrice> {
  // This would use ScrapingBee to search Food Basics website
  // const apiKey = process.env.SCRAPINGBEE_API_KEY;
  // const url = `https://www.foodbasics.ca/api/v1/products/search?q=${encodeURIComponent(item.raw_text)}`;
  
  // For MVP, return mock data
  const price = (Math.random() * 10 + 1).toFixed(2) * 1;
  const unitPrice = (Math.random() * 2 + 0.5).toFixed(2) * 1;
  
  return {
    price,
    unit_price: unitPrice,
    available: Math.random() > 0.2,
    product_name: `Food Basics ${item.raw_text}`,
    size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
    url: `https://www.foodbasics.ca/search?query=${encodeURIComponent(item.raw_text)}`,
  };
}

async function searchWalmart(item: ListItem, postal: string): Promise<StorePrice> {
  // This would use ScrapingBee to search Walmart website
  // const apiKey = process.env.SCRAPINGBEE_API_KEY;
  // const url = `https://www.walmart.ca/api/product-page/find-in-store?lang=en&upc=&postalCode=${postal}&product_id=...`;
  
  // For MVP, return mock data
  const price = (Math.random() * 10 + 1).toFixed(2) * 1;
  const unitPrice = (Math.random() * 2 + 0.5).toFixed(2) * 1;
  
  return {
    price,
    unit_price: unitPrice,
    available: Math.random() > 0.15,
    product_name: `Walmart ${item.raw_text}`,
    size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
    url: `https://www.walmart.ca/search?q=${encodeURIComponent(item.raw_text)}`,
  };
}

async function searchCostco(item: ListItem, postal: string): Promise<StorePrice> {
  // This would use ScrapingBee to search Costco website
  // const apiKey = process.env.SCRAPINGBEE_API_KEY;
  // const url = `https://www.costco.ca/CatalogSearch?keyword=${encodeURIComponent(item.raw_text)}`;
  
  // For MVP, return mock data
  const price = (Math.random() * 15 + 5).toFixed(2) * 1;
  const unitPrice = (Math.random() * 1 + 0.3).toFixed(2) * 1;
  
  return {
    price,
    unit_price: unitPrice,
    available: Math.random() > 0.3,
    product_name: `Kirkland ${item.raw_text}`,
    size: item.quantity ? `${item.quantity * 2} ${item.unit || 'ea'}` : 'bulk',
    url: `https://www.costco.ca/CatalogSearch?keyword=${encodeURIComponent(item.raw_text)}`,
  };
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

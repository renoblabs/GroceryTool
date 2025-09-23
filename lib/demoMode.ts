/**
 * Demo mode utilities for testing the app without Supabase
 * This allows users to try the application features using local storage
 */

export type DemoList = {
  id: string;
  name: string;
  created_at: string;
  items: DemoListItem[];
};

export type DemoListItem = {
  id: string;
  raw_text: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};

// Check if we're in demo mode (no Supabase credentials)
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !supabaseUrl || !supabaseKey || 
         supabaseUrl.includes('your-project') || 
         supabaseKey.includes('your-anon-key');
}

// Demo data for testing
const sampleLists: DemoList[] = [
  {
    id: 'demo-1',
    name: 'Weekly Grocery List',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    items: [
      { id: 'item-1', raw_text: 'Milk 4L', quantity: 1, unit: 'ea' },
      { id: 'item-2', raw_text: 'Bread', quantity: 2, unit: 'ea' },
      { id: 'item-3', raw_text: 'Bananas', quantity: 6, unit: 'ea' },
      { id: 'item-4', raw_text: 'Ground Beef', quantity: 1, unit: 'kg' },
      { id: 'item-5', raw_text: 'Rice', quantity: 2, unit: 'kg' },
    ]
  },
  {
    id: 'demo-2', 
    name: 'Party Supplies',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    items: [
      { id: 'item-6', raw_text: 'Chips', quantity: 3, unit: 'ea' },
      { id: 'item-7', raw_text: 'Soda 2L', quantity: 4, unit: 'ea' },
      { id: 'item-8', raw_text: 'Ice Cream', quantity: 2, unit: 'ea' },
      { id: 'item-9', raw_text: 'Paper Plates', quantity: 1, unit: 'ea' },
    ]
  }
];

// Demo storage functions
export function getDemoLists(): DemoList[] {
  if (typeof window === 'undefined') return sampleLists;
  
  try {
    const stored = localStorage.getItem('demo-grocery-lists');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error parsing demo lists from localStorage:', error);
  }
  
  // Return and save sample data
  saveDemoLists(sampleLists);
  return sampleLists;
}

export function saveDemoLists(lists: DemoList[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('demo-grocery-lists', JSON.stringify(lists));
  } catch (error) {
    console.error('Error saving demo lists to localStorage:', error);
  }
}

export function getDemoList(id: string): DemoList | null {
  const lists = getDemoLists();
  return lists.find(list => list.id === id) || null;
}

export function createDemoList(name: string, items: Omit<DemoListItem, 'id'>[]): DemoList {
  const lists = getDemoLists();
  
  const newList: DemoList = {
    id: `demo-${Date.now()}`,
    name,
    created_at: new Date().toISOString(),
    items: items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`
    }))
  };
  
  lists.push(newList);
  saveDemoLists(lists);
  
  return newList;
}

export function deleteDemoList(id: string): void {
  const lists = getDemoLists();
  const filtered = lists.filter(list => list.id !== id);
  saveDemoLists(filtered);
}

// Demo price generation
export function generateDemoPrice(itemText: string, store: string) {
  // Use item text and store to generate consistent but varied prices
  const hash = hashString(itemText + store);
  const basePrice = (hash % 1000) / 100 + 1; // $1.00 to $10.99
  const unitPrice = basePrice / ((hash % 5) + 1); // Vary unit price
  
  return {
    price: Math.round(basePrice * 100) / 100,
    unit_price: Math.round(unitPrice * 100) / 100,
    available: (hash % 10) > 1, // 90% availability
    product_name: `${capitalizeStore(store)} ${itemText}`,
    size: 'each',
    url: `https://www.${store.toLowerCase().replace(' ', '')}.ca/search?q=${encodeURIComponent(itemText)}`
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function capitalizeStore(store: string): string {
  switch (store.toLowerCase()) {
    case 'nofrills': return 'No Frills';
    case 'foodbasics': return 'Food Basics';
    case 'walmart': return 'Walmart';
    case 'costco': return 'Costco';
    default: return store;
  }
}

// Demo session simulation
export function getDemoSession() {
  return {
    user: {
      id: 'demo-user',
      email: 'demo@example.com'
    },
    access_token: 'demo-token'
  };
}
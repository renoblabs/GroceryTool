'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type ListItem = {
  id: string;
  raw_text: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};

type List = {
  id: string;
  name: string;
  created_at: string;
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

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceResults, setPriceResults] = useState<PriceResult[]>([]);
  const [checkingPrices, setCheckingPrices] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [stores, setStores] = useState({
    nofrills: true,
    foodbasics: true,
    walmart: true,
    costco: true
  });

  useEffect(() => {
    const fetchListAndItems = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push(`/login?redirect=/lists/${listId}`);
          return;
        }

        // Fetch list details
        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*')
          .eq('id', listId)
          .single();

        if (listError) {
          throw new Error(listError.message);
        }

        if (!listData) {
          throw new Error('List not found');
        }

        // Fetch list items
        const { data: itemsData, error: itemsError } = await supabase
          .from('list_items')
          .select('*')
          .eq('list_id', listId)
          .order('created_at', { ascending: true });

        if (itemsError) {
          throw new Error(itemsError.message);
        }

        setList(listData);
        setItems(itemsData || []);
      } catch (err: any) {
        console.error('Error fetching list:', err);
        setError(err.message || 'Failed to load list');
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchListAndItems();
    }
  }, [listId, router]);

  const runPriceCheck = async () => {
    setCheckingPrices(true);
    setPriceError(null);

    try {
      // Get current session and token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        router.push(`/login?redirect=/lists/${listId}`);
        return;
      }

      // Default postal code
      const postalCode = 
        process.env.NEXT_PUBLIC_DEFAULT_POSTAL_CODE || 'L3K 1V8';

      // Call price check API
      const response = await fetch('/api/price/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          list_id: listId,
          stores,
          postal: postalCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check prices');
      }

      const results = await response.json();
      setPriceResults(results.items || []);
    } catch (err: any) {
      console.error('Error checking prices:', err);
      setPriceError(err.message || 'Failed to check prices');
      
      // For MVP, if the API isn't implemented yet, show mock data
      if (err.message.includes('Failed to fetch') || err.message.includes('404')) {
        console.log('Using mock price data for MVP');
        const mockResults = items.map(item => ({
          item_id: item.id,
          raw_text: item.raw_text,
          nofrills: {
            price: (Math.random() * 10 + 1).toFixed(2) * 1,
            unit_price: (Math.random() * 2 + 0.5).toFixed(2) * 1,
            available: Math.random() > 0.1,
            product_name: `No Frills ${item.raw_text}`,
            size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
          },
          foodbasics: {
            price: (Math.random() * 10 + 1).toFixed(2) * 1,
            unit_price: (Math.random() * 2 + 0.5).toFixed(2) * 1,
            available: Math.random() > 0.2,
            product_name: `Food Basics ${item.raw_text}`,
            size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
          },
          walmart: {
            price: (Math.random() * 10 + 1).toFixed(2) * 1,
            unit_price: (Math.random() * 2 + 0.5).toFixed(2) * 1,
            available: Math.random() > 0.15,
            product_name: `Walmart ${item.raw_text}`,
            size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
          },
          costco: {
            price: (Math.random() * 15 + 5).toFixed(2) * 1,
            unit_price: (Math.random() * 1 + 0.3).toFixed(2) * 1,
            available: Math.random() > 0.3,
            product_name: `Kirkland ${item.raw_text}`,
            size: item.quantity ? `${item.quantity * 2} ${item.unit || 'ea'}` : 'bulk',
          },
          best_store: ['nofrills', 'foodbasics', 'walmart', 'costco'][Math.floor(Math.random() * 4)] as 'nofrills' | 'foodbasics' | 'walmart' | 'costco',
        }));
        
        setPriceResults(mockResults);
      }
    } finally {
      setCheckingPrices(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toggle store selection
  const toggleStore = (store: keyof typeof stores) => {
    setStores(prev => ({
      ...prev,
      [store]: !prev[store]
    }));
  };

  // Get store display name
  const getStoreName = (store: string) => {
    switch (store) {
      case 'nofrills': return 'No Frills';
      case 'foodbasics': return 'Food Basics';
      case 'walmart': return 'Walmart';
      case 'costco': return 'Costco';
      default: return store;
    }
  };

  if (loading) {
    return <div className="loading">Loading list...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/lists" className="btn">
          Back to Lists
        </Link>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="not-found">
        <h1>List not found</h1>
        <Link href="/lists" className="btn mt-4">
          Back to Lists
        </Link>
      </div>
    );
  }

  return (
    <div className="list-detail-page">
      <div className="header-actions mb-4">
        <div>
          <Link href="/lists" className="back-link">
            ← Back to Lists
          </Link>
          <h1 className="text-xl mt-2">{list.name}</h1>
          <p className="text-sm text-gray">
            Created: {formatDate(list.created_at)}
          </p>
        </div>
        <div className="actions">
          <button
            onClick={runPriceCheck}
            disabled={checkingPrices || items.length === 0}
            className="btn"
          >
            {checkingPrices ? 'Checking Prices...' : 'Run Price Check'}
          </button>
        </div>
      </div>

      <div className="store-selection mb-4">
        <h2 className="mb-2">Select Stores</h2>
        <div className="store-toggles">
          {Object.entries(stores).map(([store, selected]) => (
            <label key={store} className={`store-toggle ${selected ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleStore(store as keyof typeof stores)}
              />
              <span>{getStoreName(store)}</span>
            </label>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <p>This list is empty.</p>
        </div>
      ) : (
        <div className="items-table-container mb-6">
          <h2 className="mb-2">Items ({items.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.raw_text}</td>
                  <td>{item.quantity !== null ? item.quantity : ''}</td>
                  <td>{item.unit || ''}</td>
                  <td>{item.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {priceError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {priceError}
        </div>
      )}

      {priceResults.length > 0 && (
        <div className="price-results">
          <h2 className="mb-2">Price Comparison Results</h2>
          
          <div className="results-summary card mb-4">
            <h3 className="mb-2">Summary</h3>
            <div className="summary-stats">
              {Object.entries(stores)
                .filter(([, selected]) => selected)
                .map(([store]) => {
                  const storeTotal = priceResults.reduce((sum, item) => {
                    const storeData = item[store as keyof PriceResult] as StorePrice | undefined;
                    return sum + (storeData && storeData.available ? storeData.price : 0);
                  }, 0);
                  
                  const itemCount = priceResults.filter(
                    item => item[store as keyof PriceResult] && (item[store as keyof PriceResult] as StorePrice).available
                  ).length;
                  
                  return (
                    <div key={store} className="store-summary">
                      <h4>{getStoreName(store)}</h4>
                      <p className="total">{formatCurrency(storeTotal)}</p>
                      <p className="text-sm text-gray">{itemCount} of {items.length} items available</p>
                    </div>
                  );
                })}
            </div>
            
            <h3 className="mt-4 mb-2">Optimized Shopping</h3>
            <p>
              For the best prices, shop at these stores:
            </p>
            <ul className="store-list">
              {Object.entries(stores)
                .filter(([, selected]) => selected)
                .map(([store]) => {
                  const bestItems = priceResults.filter(item => item.best_store === store);
                  if (bestItems.length === 0) return null;
                  
                  const storeTotal = bestItems.reduce((sum, item) => {
                    const storeData = item[store as keyof PriceResult] as StorePrice;
                    return sum + (storeData && storeData.available ? storeData.price : 0);
                  }, 0);
                  
                  return (
                    <li key={store}>
                      <strong>{getStoreName(store)}</strong>: {bestItems.length} items, {formatCurrency(storeTotal)}
                    </li>
                  );
                })
                .filter(Boolean)}
            </ul>
          </div>
          
          <div className="detailed-results">
            <h3 className="mb-2">Detailed Price Comparison</h3>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    {Object.entries(stores)
                      .filter(([, selected]) => selected)
                      .map(([store]) => (
                        <th key={store}>{getStoreName(store)}</th>
                      ))}
                    <th>Best Deal</th>
                  </tr>
                </thead>
                <tbody>
                  {priceResults.map((result) => (
                    <tr key={result.item_id}>
                      <td>{result.raw_text}</td>
                      {Object.entries(stores)
                        .filter(([, selected]) => selected)
                        .map(([store]) => {
                          const storeData = result[store as keyof PriceResult] as StorePrice | undefined;
                          
                          if (!storeData || !storeData.available) {
                            return <td key={store} className="not-available">Not available</td>;
                          }
                          
                          return (
                            <td key={store} className={result.best_store === store ? 'best-price' : ''}>
                              <div className="price">{formatCurrency(storeData.price)}</div>
                              {storeData.unit_price && (
                                <div className="unit-price text-sm">
                                  {formatCurrency(storeData.unit_price)}/unit
                                </div>
                              )}
                              <div className="product-name text-sm">{storeData.product_name}</div>
                              {storeData.size && (
                                <div className="size text-sm text-gray">{storeData.size}</div>
                              )}
                            </td>
                          );
                        })}
                      <td className="best-store">
                        {getStoreName(result.best_store)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .back-link {
          color: var(--gray-500);
          font-size: 0.9rem;
        }
        
        .store-selection {
          margin-top: 1.5rem;
        }
        
        .store-toggles {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .store-toggle {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border: 1px solid var(--gray-300);
          border-radius: var(--border-radius);
          cursor: pointer;
          user-select: none;
        }
        
        .store-toggle.selected {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .store-toggle input {
          margin-right: 0.5rem;
          width: auto;
        }
        
        .items-table-container {
          margin-top: 1.5rem;
          overflow-x: auto;
        }
        
        .price-results {
          margin-top: 2rem;
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .store-summary {
          padding: 1rem;
          border: 1px solid var(--gray-200);
          border-radius: var(--border-radius);
          background-color: var(--gray-100);
        }
        
        .store-summary .total {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--primary);
        }
        
        .store-list {
          list-style: disc;
          margin-left: 1.5rem;
          margin-top: 0.5rem;
        }
        
        .table-responsive {
          overflow-x: auto;
        }
        
        .not-available {
          color: var(--gray-500);
          font-style: italic;
        }
        
        .best-price {
          background-color: rgba(34, 197, 94, 0.1);
          font-weight: 500;
        }
        
        .price {
          font-weight: 600;
        }
        
        .best-store {
          font-weight: 600;
          color: var(--success);
        }
      `}</style>
    </div>
  );
}

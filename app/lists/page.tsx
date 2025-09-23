'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { isDemoMode, getDemoLists, getDemoSession, type DemoList } from '@/lib/demoMode';

type List = {
  id: string;
  name: string;
  created_at: string;
  item_count?: number;
};

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode
    const isDemo = isDemoMode();
    setDemoMode(isDemo);
    
    if (isDemo) {
      // Use demo data
      const demoLists = getDemoLists();
      const demoSession = getDemoSession();
      
      setSession(demoSession as any);
      setLists(demoLists.map(list => ({
        id: list.id,
        name: list.name,
        created_at: list.created_at,
        item_count: list.items.length
      })));
      setLoading(false);
      return;
    }

    // Check for session and fetch lists
    const fetchSessionAndLists = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(sessionError.message);
        }
        
        setSession(session);

        // If not authenticated, don't try to fetch lists
        if (!session) {
          setLoading(false);
          return;
        }

        // Fetch lists with item count
        const { data, error: listsError } = await supabase
          .from('lists')
          .select(`
            *,
            list_items:list_items(count)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (listsError) {
          throw new Error(listsError.message);
        }

        // Transform data to include item count
        const listsWithCount = data.map(list => ({
          id: list.id,
          name: list.name,
          created_at: list.created_at,
          item_count: list.list_items?.[0]?.count || 0
        }));

        setLists(listsWithCount);
      } catch (err: any) {
        console.error('Error fetching lists:', err);
        setError(err.message || 'Failed to load lists');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndLists();

    // Set up auth state change listener only if not in demo mode
    if (!isDemo) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, currentSession) => {
          setSession(currentSession);
          if (currentSession) {
            fetchSessionAndLists();
          } else {
            setLists([]);
          }
        }
      );

      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Format date to be more readable
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

  if (!session) {
    return (
      <div className="not-authenticated">
        <h1 className="text-xl mb-4">Your Lists</h1>
        <div className="card">
          <p className="mb-4">Please sign in to view and manage your grocery lists.</p>
          <Link href="/login?redirect=/lists" className="btn">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lists-page">
      <div className="header-actions mb-4">
        <h1 className="text-xl">Your Lists</h1>
        <Link href="/import" className="btn">
          Create New List
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading your lists...</div>
      ) : lists.length === 0 ? (
        <div className="card">
          <p className="mb-4">You don't have any grocery lists yet.</p>
          <p className="mb-4">Create your first list to start comparing prices across stores.</p>
          <Link href="/import" className="btn">
            Create Your First List
          </Link>
        </div>
      ) : (
        <div className="lists-container">
          {lists.map((list) => (
            <Link href={`/lists/${list.id}`} key={list.id} className="list-card card">
              <h2 className="list-name">{list.name}</h2>
              <div className="list-meta">
                <span className="item-count">{list.item_count} items</span>
                <span className="created-at">{formatDate(list.created_at)}</span>
              </div>
              <div className="list-actions">
                <span className="view-list">View List →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lists-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .list-card {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .list-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .list-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .list-meta {
          display: flex;
          justify-content: space-between;
          color: var(--gray-500);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .list-actions {
          margin-top: auto;
          text-align: right;
        }

        .view-list {
          color: var(--primary);
          font-weight: 500;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--gray-500);
        }
      `}</style>
    </div>
  );
}

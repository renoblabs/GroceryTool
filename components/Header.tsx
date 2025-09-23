'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { isDemoMode, getDemoSession } from '@/lib/demoMode';
import { Session } from '@supabase/supabase-js';

export default function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDemo = isDemoMode();
    setDemoMode(isDemo);
    
    if (isDemo) {
      // Use demo session
      const demoSession = getDemoSession();
      setSession(demoSession as any);
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (demoMode) {
      // In demo mode, just clear the session state
      setSession(null);
      return;
    }

    await supabase.auth.signOut();
  };

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="logo">
          <h1>Grocery Tool</h1>
        </Link>
        
        <nav className="nav">
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/import">Import</Link></li>
            <li><Link href="/lists">Lists</Link></li>
          </ul>
          
          <div className="auth-section">
            {loading ? (
              <div className="auth-loading">Loading...</div>
            ) : session ? (
              <div className="user-menu">
                <span className="user-email">
                  {demoMode ? '👤 Demo User' : session.user.email}
                </span>
                <button onClick={handleSignOut} className="btn-logout">
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-login">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </div>
      
      <style jsx>{`
        .header {
          background-color: var(--gray-100);
          border-bottom: 1px solid var(--gray-200);
          padding: 1rem 0;
        }
        
        .header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        
        .logo {
          text-decoration: none;
          color: inherit;
        }
        
        .logo h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--primary);
          margin: 0;
        }
        
        .nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .nav-links {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
        }
        
        .nav-links a {
          color: var(--foreground);
          text-decoration: none;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          transition: background-color 0.2s;
        }
        
        .nav-links a:hover {
          background-color: var(--gray-200);
          text-decoration: none;
        }
        
        .auth-section {
          display: flex;
          align-items: center;
        }
        
        .auth-loading {
          color: var(--gray-500);
          font-size: 0.875rem;
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-email {
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        
        .btn-logout {
          background: none;
          border: 1px solid var(--gray-300);
          color: var(--gray-600);
          padding: 0.375rem 0.75rem;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-logout:hover {
          background-color: var(--gray-100);
          border-color: var(--gray-400);
        }
        
        .btn-login {
          background-color: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .btn-login:hover {
          background-color: #0060df;
          text-decoration: none;
        }
        
        @media (max-width: 768px) {
          .header .container {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }
          
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .user-menu {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
        
        @media (max-width: 480px) {
          .nav-links {
            gap: 1rem;
          }
          
          .user-email {
            text-align: center;
          }
        }
      `}</style>
    </header>
  );
}
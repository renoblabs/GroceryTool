'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      setSession(data.session);
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Check your email for the login link!' 
        });
        setEmail('');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Signed out successfully!' });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred while signing out.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h1 className="text-xl mb-4">Account Access</h1>
      
      {message && (
        <div 
          className={`p-3 mb-4 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {session ? (
        <div>
          <p className="mb-4">
            Signed in as: <strong>{session.user.email}</strong>
          </p>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="btn"
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="btn w-full"
          >
            {loading ? 'Sending magic link...' : 'Send magic link'}
          </button>
          <p className="text-sm text-gray mt-4">
            We'll email you a magic link for password-free sign in.
          </p>
        </form>
      )}
    </div>
  );
}

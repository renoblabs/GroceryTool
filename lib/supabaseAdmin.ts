import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client with admin privileges using the service role key.
 * IMPORTANT: This should ONLY be used in server contexts (API routes, server actions)
 * and never exposed to the client.
 */
export function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// We create the client but don't throw a hard error at the top level.
// This prevents the Next.js build process from crashing during static prerendering.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to verify connection at runtime
export function verifySupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing!');
    return false;
  }
  return true;
}

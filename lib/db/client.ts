import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// To prevent the build from crashing when variables are missing during prerendering,
// we wrap the client creation in a try-catch or check for values.
let supabaseClient;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error('Supabase client initialization failed during build');
}

export const supabase = supabaseClient || createClient('', '');

export function verifySupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing!');
    return false;
  }
  return true;
}

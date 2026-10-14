import { createClient } from '@supabase/supabase-js'

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client object to prevent the build from crashing
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: 'Missing Config' } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Missing Config' } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              single: async () => ({ data: null, error: { message: 'Missing Config' } }),
            }),
          }),
        }),
        insert: () => ({
          select: async () => ({ data: null, error: { message: 'Missing Config' } }),
        }),
        delete: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: 'Missing Config' } }),
          }),
        }),
      }),
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export function verifySupabaseConfig() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

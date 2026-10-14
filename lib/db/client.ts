import { createClient } from '@supabase/supabase-js'

// This is the key: We cast the return type to 'any' to stop TypeScript
// from fighting with the mock client and the real client during the build.
export const getSupabaseClient = (): any => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
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

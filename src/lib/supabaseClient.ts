// src/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL?.trim();
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null;

// optional: helper
export const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Konfigurasi Supabase tidak lengkap. Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di Vercel.');
  }
  return supabase;
};

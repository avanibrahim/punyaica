// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,        // <- pastikan ENV ada
  import.meta.env.VITE_SUPABASE_ANON_KEY!    // <- pastikan ENV ada
);

// (opsional, buat debug di dev)
if (import.meta.env.DEV) {
  console.log('supabase env ok?', !!import.meta.env.VITE_SUPABASE_URL, !!import.meta.env.VITE_SUPABASE_ANON_KEY);
}

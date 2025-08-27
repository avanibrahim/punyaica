// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard biar error-nya jelas saat build/test
if (!url) throw new Error('VITE_SUPABASE_URL tidak ter-set');
if (!anon) throw new Error('VITE_SUPABASE_ANON_KEY tidak ter-set');

export const supabase = createClient(url, anon);

import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eposndkvwefutassaroz.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gVeHwc2mZHjgAEWYs0eHug_UmM53rDB';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Only create the client if the variables exist to prevent crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

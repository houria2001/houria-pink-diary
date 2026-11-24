import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// These browser-safe values come from Supabase Project Settings > API.
// Never put a service_role key or database password in this file.
const SUPABASE_URL = 'https://mlpipmdgolxialymehbz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Vb76mBjWtWcGwX8uQd-1dQ_ZFiXooMZ';

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR_') &&
  !SUPABASE_PUBLISHABLE_KEY.includes('YOUR_');

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// AFTER creating your Supabase project, paste the Project URL + anon (public)
// key below. The anon key is SAFE to ship in the app — it's public and access is
// controlled by your Storage bucket policies (see README setup steps).
export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
export const ALBUM_BUCKET = 'album';

export const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');

export const supabase = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

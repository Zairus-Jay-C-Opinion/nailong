import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// AFTER creating your Supabase project, paste the Project URL + anon (public)
// key below. The anon key is SAFE to ship in the app — it's public and access is
// controlled by your Storage bucket policies (see README setup steps).
export const SUPABASE_URL = 'https://iclqylxxkjucexirjyce.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbHF5bHh4a2p1Y2V4aXJqeWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzg0OTgsImV4cCI6MjA5NzYxNDQ5OH0.3xJXFiJY4kDnWLIkYA5NNp1qciwAd7HjT4KYJ0c-xT0';
export const ALBUM_BUCKET = 'album';

export const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');

export const supabase = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

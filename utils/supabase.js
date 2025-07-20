// File: utils/supabase.js

import 'react-native-url-polyfill/auto'; // This must be imported first
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and Key from your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Create and export the Supabase client
// This 'supabase' object is what you'll use in other files to talk to your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
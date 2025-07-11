// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zhnrtxjgimzsezxedtne.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobnJ0eGpnaW16c2V6eGVkdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjEwMTQsImV4cCI6MjA2NzEzNzAxNH0.fi2tjADV80yLBAlfVXKTFiHyKNFZOiuyoOqcrqDqSh4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
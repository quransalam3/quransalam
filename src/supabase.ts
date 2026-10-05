import { createClient } from '@supabase/supabase-js';

// Mengakses variabel lingkungan Vite menggunakan import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ubyrtmcrdeltgcfurouy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieXJ0bWNyZGVsdGdjZnVyb3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTcyNjgsImV4cCI6MjEwNjc3MzI2OH0.Y3b04pp95QDCd2vhnJZ-fj2C3jC_nJdQ6LzWs17Uxe0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { supabaseUrl, supabaseAnonKey };

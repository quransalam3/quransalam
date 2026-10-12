import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Mengakses variabel lingkungan Vite menggunakan import.meta.env dengan fallback aman
export const supabaseUrl: string = 
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_URL) ||
  'https://ubyrtmcrdeltgcfurouy.supabase.co';

export const supabaseAnonKey: string = 
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieXJ0bWNyZGVsdGdjZnVyb3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTcyNjgsImV4cCI6MjEwNjc3MzI2OH0.Y3b04pp95QDCd2vhnJZ-fj2C3jC_nJdQ6LzWs17Uxe0';

// Fallback config from localStorage if updated via Admin UI
const storedConfig = (() => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('salam_cloud_db_config') : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const activeUrl = storedConfig?.url || supabaseUrl;
const activeKey = storedConfig?.anonKey || supabaseAnonKey;

export const supabase: SupabaseClient = createClient(activeUrl, activeKey);

export function isCloudConnected(): boolean {
  return !!(activeUrl && activeKey && activeUrl.startsWith('http'));
}

export function saveCloudConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('salam_cloud_db_config', JSON.stringify({ url, anonKey }));
  }
}

export function getCloudConfig() {
  return {
    url: activeUrl,
    anonKey: activeKey,
    hasEnv: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  };
}

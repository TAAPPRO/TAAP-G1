import { createClient } from '@supabase/supabase-js';

// ==================================================================================
// 🟢 QUICK FIX: PASTE YOUR KEYS HERE TO STOP ASKING EVERY TIME
// ==================================================================================
// Fix: Explicitly type as string to avoid literal type inference issues
export const HARDCODED_URL: string = "https://wzxbonhsimqcofoakqjt.supabase.co"; 
export const HARDCODED_KEY: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eGJvbmhzaW1xY29mb2FrcWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Mjk2NTYsImV4cCI6MjA4MDUwNTY1Nn0.mClmNKSUjERHj4x3nOfnxlRwX10dQiIQK158fCwGPPw"; 
// ==================================================================================

// --- SECURITY CONFIGURATION ---
// Priority:
// 1. Hardcoded variables (Top of this file)
// 2. LocalStorage (Set via Admin Panel UI)
// 3. Environment Variables (.env file)

const getEnvVar = (key: string): string | undefined => {
  // 1. Check Hardcoded
  // Fix: Removed redundant truthiness check that caused 'never' type inference on empty string constants
  if (key === 'VITE_SUPABASE_URL' && HARDCODED_URL.length > 5) return HARDCODED_URL;
  if (key === 'VITE_SUPABASE_ANON_KEY' && HARDCODED_KEY.length > 10) return HARDCODED_KEY;

  try {
    // 2. Check LocalStorage (Dynamic Setup via UI)
    if (typeof window !== 'undefined' && window.localStorage) {
        const localVal = window.localStorage.getItem(key);
        if (localVal) return localVal;
    }

    // 3. Check Environment Variables
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  } catch (e) {}
  return undefined;
};

const envUrl = getEnvVar('VITE_SUPABASE_URL');
const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = envKey || 'placeholder-key';

if (!envUrl || !envKey) {
    console.warn("Supabase credentials missing! Please configure them in 'services/supabaseClient.ts' (Hardcoded) OR Admin Panel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
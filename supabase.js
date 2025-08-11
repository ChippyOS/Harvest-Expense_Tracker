// Supabase client setup for browser usage.
// Use the anon public key with Row Level Security enabled on your tables.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configure with your project's URL and anon API key (never expose service_role keys client-side)
const SUPABASE_URL = "https://jtjmzzjtfflcfjgednit.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0am16emp0ZmZsY2ZqZ2Vkbml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTk5NDMsImV4cCI6MjA2ODE5NTk0M30.VFZwUS6Jc4JsgcVEGv8-SiOoTQvNBXzthdGxW1VAnj0";

// Shared Supabase client instance for the app
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
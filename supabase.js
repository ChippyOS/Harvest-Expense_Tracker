import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://jtjmzzjtfflcfjgednit.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0am16emp0ZmZsY2ZqZ2Vkbml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTk5NDMsImV4cCI6MjA2ODE5NTk0M30.VFZwUS6Jc4JsgcVEGv8-SiOoTQvNBXzthdGxW1VAnj0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
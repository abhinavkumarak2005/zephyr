import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { error: e1 } = await supabase.rpc('exec', { query: 'alter table public.judges add column if not exists evaluation_enabled boolean default false not null;' });
  console.log(e1);
  const { error: e2 } = await supabase.rpc('exec', { query: 'alter table public.evaluations add column if not exists selected_status boolean;' });
  console.log(e2);
}
run();

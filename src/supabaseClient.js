import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ulqwrupjrnfbcjmpcrel.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscXdydXBqcm5mYmNqbXBjcmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODg3MzAsImV4cCI6MjA5Mjk2NDczMH0.bMimtKhCsCtGMpFeDg0xn2YPJ6QxOGrJ5uPsWDWPaGs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ALLOWED_EMAILS = [
  'sergiorodriguezjuez93@gmail.com',
  'alvaro.abreu@outlook.es',
];

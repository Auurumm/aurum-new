import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL과 API Key를 .env.local 파일에 설정해주세요.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
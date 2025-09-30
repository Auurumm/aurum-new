import { createClient } from '@supabase/supabase-js'

console.log('=== 환경 변수 디버깅 ===')
console.log('process.env:', process.env)
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL)
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY)

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL과 API Key를 .env 파일에 설정해주세요.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
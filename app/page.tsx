import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('shows').select('*')
  
  return (
    <main>
      <h1>CineStyle</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  )
}
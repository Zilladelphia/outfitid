import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function ShowsPage() {
  const { data: shows } = await supabase.from('shows').select('*')

  return (
    <div className="px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">All Shows</h1>
      <p className="text-zinc-400 mb-10">Browse outfits by show</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shows?.map((show) => (
          <Link href={`/shows/${show.id}`} key={show.id}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500 transition cursor-pointer">
                        {show.thumbnail_url && (
            <img src={show.thumbnail_url} alt={show.title} className="w-full h-32 object-contain mb-4 rounded-lg"/>
            )}
            <h3 className="text-white font-semibold text-lg">{show.title}</h3>
              <Badge className="mt-2 bg-zinc-800 text-zinc-400">{show.type}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
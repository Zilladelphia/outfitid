import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>
}) {
  const { q } = await searchParams
  const query = q?.toLowerCase() || ''

  const { data: shows } = await supabase
    .from('shows')
    .select('*')
    .ilike('title', `%${query}%`)

  const { data: actors } = await supabase
    .from('actors')
    .select('*')
    .ilike('name', `%${query}%`)

  const { data: outfits } = await supabase
    .from('outfits')
    .select(`*, actors(*), products(*)`)
    .ilike('scene_description', `%${query}%`)

  return (
    <div className="px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">
        Results for <span className="text-purple-500">"{q}"</span>
      </h1>

      {/* Shows */}
      {shows && shows.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Shows</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shows.map((show) => (
              <Link href={`/shows/${show.id}`} key={show.id}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500 transition">
                  <h3 className="text-white font-semibold">{show.title}</h3>
                  <Badge className="mt-2 bg-zinc-800 text-zinc-400">{show.type}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actors */}
      {actors && actors.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Actors & Influencers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actors.map((actor) => (
              <Link href={`/actors/${actor.id}`} key={actor.id}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500 transition text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">{actor.name.charAt(0)}</span>
                  </div>
                  <p className="text-white font-medium">{actor.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Outfits */}
      {outfits && outfits.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Outfits</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {outfits.map((outfit) => (
              <Link href={`/shows/${outfit.show_id}`} key={outfit.id}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500 transition">
                  {outfit.products?.[0]?.image_url && (
                    <img src={outfit.products[0].image_url} alt={outfit.scene_description} className="w-full h-56 object-cover"/>
                  )}
                  <div className="p-4">
                    <p className="text-white font-medium">{outfit.scene_description}</p>
                    <p className="text-purple-400 text-sm">{outfit.actors?.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {shows?.length === 0 && actors?.length === 0 && outfits?.length === 0 && (
        <p className="text-zinc-400 mt-8">No results found for "{q}"</p>
      )}
    </div>
  )
}
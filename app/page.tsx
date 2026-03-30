import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function Home() {
  const { data: shows } = await supabase.from('shows').select('*')
  const { data: outfits } = await supabase
    .from('outfits')
    .select(`*, actors(*), products(*)`)
    .limit(6)

  return (
    <div>
      {/* Hero */}
      <div className="px-8 py-20 border-b border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950">
        <h1 className="text-6xl font-bold text-white mb-4">
          See it. <span className="text-purple-500">Shop it.</span>
        </h1>
        <p className="text-zinc-400 text-xl mb-8">Identify outfits from your favorite shows and influencers.</p>
        <Link href="/shows" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition">
          Browse Shows →
        </Link>
      </div>

      {/* Featured Outfits */}
      <div className="px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">Latest Outfits</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {outfits?.map((outfit) => (
            <Link href={`/shows/${outfit.show_id}`} key={outfit.id}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500 transition">
                {outfit.products?.[0]?.image_url && (
                  <img src={outfit.products[0].image_url} alt={outfit.scene_description} className="w-full h-72 object-cover"/>
                )}
                <div className="p-4">
                  <p className="text-white font-medium">{outfit.scene_description}</p>
                  <p className="text-purple-400 text-sm mt-1">{outfit.actors?.name}</p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {outfit.style_tags?.slice(0,2).map((tag: string) => (
                      <Badge key={tag} className="bg-zinc-800 text-zinc-400 text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse by Show */}
      <div className="px-8 pb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Browse by Show</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shows?.map((show) => (
            <Link href={`/shows/${show.id}`} key={show.id}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500 transition">
                <h3 className="text-white font-semibold text-lg">{show.title}</h3>
                <Badge className="mt-2 bg-zinc-800 text-zinc-400">{show.type}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function ActorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: actor } = await supabase
    .from('actors')
    .select('*')
    .eq('id', id)
    .single()

  const { data: outfits } = await supabase
    .from('outfits')
    .select(`*, products(*)`)
    .eq('actor_id', id)

  return (
    <div className="px-8 py-12">
      <Link href="/" className="text-zinc-400 text-sm hover:text-white mb-6 block">← Back</Link>
      
      <h1 className="text-4xl font-bold text-white mb-1">{actor?.name}</h1>
<div className="flex items-center gap-4 mb-10">
  <p className="text-zinc-400">{outfits?.length} outfits</p>
  {actor?.instagram_url && (
    <a href={actor.instagram_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-sm hover:text-purple-300">
      @{actor.instagram_url.split('/').filter(Boolean).pop()}
    </a>
  )}
</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {outfits?.map((outfit) => (
          <div key={outfit.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500 transition">
            {outfit.products?.[0]?.image_url && (
              <img src={outfit.products[0].image_url} alt={outfit.scene_description} className="w-full h-64 object-cover"/>
            )}
            <div className="p-4">
              <p className="text-white font-medium mb-2">{outfit.scene_description}</p>
              <div className="flex gap-2 flex-wrap mb-3">
                {outfit.style_tags?.map((tag: string) => (
                  <Badge key={tag} className="bg-zinc-800 text-zinc-400">{tag}</Badge>
                ))}
              </div>
              {outfit.products?.[0] && (
                <a href={outfit.products[0].product_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-sm hover:text-purple-300">Shop Now →</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
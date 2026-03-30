import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function ActorsPage() {
  const { data: actors } = await supabase.from('actors').select('*')

  return (
    <div className="px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">Actors & Influencers</h1>
      <p className="text-zinc-400 mb-10">Browse outfits by person</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {actors?.map((actor) => (
          <div key={actor.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500 transition text-center">
            <Link href={`/actors/${actor.id}`}>
                            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                {actor.photo_url ? (
                    <img src={actor.photo_url} alt={actor.name} className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full bg-purple-900 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{actor.name.charAt(0)}</span>
                    </div>
                )}
                </div>
              <p className="text-white font-medium">{actor.name}</p>
            </Link>
            {actor.instagram_url && (
              <a href={actor.instagram_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-xs hover:text-purple-300 mt-1 block">
                Instagram →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
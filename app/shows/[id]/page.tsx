import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: show } = await supabase
    .from('shows')
    .select('*')
    .eq('id', id)
    .single()

  const { data: outfits } = await supabase
    .from('outfits')
    .select(`*, actors(*), products(*)`)
    .eq('show_id', id)

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-2">{show?.title}</h1>
      <p className="text-gray-500 mb-8">Outfits from the show</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {outfits?.map((outfit) => (
          <Card key={outfit.id}>
            <CardHeader>
              <CardTitle>
  <Link href={`/actors/${outfit.actors?.id}`} className="text-white hover:text-purple-400 transition">
    {outfit.character_name}
  </Link>
</CardTitle>
              <p className="text-sm text-gray-500">{outfit.scene_description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap mb-4">
                {outfit.style_tags?.map((tag: string) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <div className="space-y-2">
                {outfit.products?.map((product: any) => (
                    <div key={product.id} className="border rounded p-2">
                        {product.image_url && (
                        <img src={product.image_url} alt={product.description} className="w-full h-48 object-cover rounded mb-2"/>
                        )}
                        <p className="font-medium">{product.description}</p>
                        <p className="text-sm text-gray-500">{product.retailer} — ${product.price}</p>
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">Shop Now →</a>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
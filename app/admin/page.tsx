'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [actorName, setActorName] = useState('')
  const [showTitle, setShowTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedProducts, setSavedProducts] = useState<number[]>([])
  const [outfitId, setOutfitId] = useState<string | null>(null)
  const [mode, setMode] = useState<'new' | 'existing'>('new')
  const [existingOutfits, setExistingOutfits] = useState<any[]>([])
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>('')
  const [shows, setShows] = useState<any[]>([])
  const [actors, setActors] = useState<any[]>([])
  const [actorPhoto, setActorPhoto] = useState('')
  const [actorInstagram, setActorInstagram] = useState('')

  useEffect(() => {
    supabase.from('shows').select('*').then(({ data }) => setShows(data || []))
    supabase.from('actors').select('*').then(({ data }) => setActors(data || []))
    supabase
      .from('outfits')
      .select(`*, actors(*), shows(*)`)
      .then(({ data }) => setExistingOutfits(data || []))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
    setResult(null)
    setOutfitId(null)
    setSavedProducts([])
  }

  const handleAnalyze = async () => {
    if (!image) return

    if (mode === 'new' && (!actorName || !showTitle)) {
      alert('Please enter Actor Name and Show Title before analyzing.')
      return
    }
    if (mode === 'existing' && !selectedOutfitId) {
      alert('Please select an existing outfit.')
      return
    }

    setLoading(true)
    setResult(null)
    const res = await fetch('/api/analyze-outfit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const handleConfirmAndSave = async (item: any, product: any, index: number) => {
    const ok = confirm(
      `Save this product?\n\n${item.item_type} — ${item.color}\n${product.title}\n${product.price}\n\nActor: ${actorName || 'existing'}\nShow: ${showTitle || 'existing'}`
    )
    if (!ok) return

    setSaving(true)
    try {
      let currentOutfitId = outfitId

      if (mode === 'existing') {
        currentOutfitId = selectedOutfitId
      }

      // Upload image to Imgur
      let imageUrl = ''
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        const imgurRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })
        const imgurData = await imgurRes.json()
        imageUrl = imgurData.url || ''
      }

      // Create outfit once if new mode
      if (mode === 'new' && !currentOutfitId) {
        // Get or create actor
        let { data: actor } = await supabase
          .from('actors')
          .select('id')
          .eq('name', actorName)
          .single()

        if (!actor) {
          const { data: newActor } = await supabase
          .from('actors')
          .insert({ 
            name: actorName,
            photo_url: actorPhoto || null,
            instagram_url: actorInstagram || null,
          })
          .select()
          .single()
          actor = newActor
        }

        // Get show
        const { data: show } = await supabase
          .from('shows')
          .select('id')
          .eq('title', showTitle)
          .single()

        if (!show) {
          alert(`Show "${showTitle}" not found. Check the spelling.`)
          setSaving(false)
          return
        }

        // Create outfit
        const { data: outfit } = await supabase
          .from('outfits')
          .insert({
            show_id: show.id,
            actor_id: actor?.id,
            character_name: actorName,
            scene_description: result.scene_description,
            style_tags: [result.overall_style],
            outfit_image_url: imageUrl,
          })
          .select()
          .single()

        currentOutfitId = outfit?.id
        setOutfitId(outfit?.id)
      }

      // Save product with uploaded image
      await supabase.from('products').insert({
        outfit_id: currentOutfitId,
        item_type: item.item_type,
        color: item.color,
        description: item.description,
        product_url: product.product_url,
        image_url: imageUrl,
        price: parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
        retailer: product.retailer,
      })

      setSavedProducts((prev) => [...prev, index])
    } catch (err: any) {
      console.error(err)
      alert('Error saving: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <div className="px-8 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-2">Admin</h1>
      <p className="text-zinc-400 mb-8">AI outfit identifier + product saver</p>

      {/* Mode toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setMode('new'); setResult(null); setOutfitId(null) }}
          className={`px-4 py-2 rounded-xl text-sm ${mode === 'new' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
        >
          New Outfit
        </button>
        <button
          onClick={() => { setMode('existing'); setResult(null); setOutfitId(null) }}
          className={`px-4 py-2 rounded-xl text-sm ${mode === 'existing' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
        >
          Add to Existing Outfit
        </button>
      </div>

      {/* New outfit inputs */}
      {mode === 'new' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Actor Name</label>
            <input
              value={actorName}
              onChange={(e) => setActorName(e.target.value)}
              placeholder="e.g. JaNa Craig"
              list="actors-list"
              className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500"
            />
            <datalist id="actors-list">
              {actors.map((a) => <option key={a.id} value={a.name} />)}
            </datalist>
          </div>
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Show Title</label>
            <input
              value={showTitle}
              onChange={(e) => setShowTitle(e.target.value)}
              placeholder="e.g. Love Island"
              list="shows-list"
              className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500"
            />
            <datalist id="shows-list">
              {shows.map((s) => <option key={s.id} value={s.title} />)}
            </datalist>
          </div>
        <div>
          <label className="text-zinc-400 text-sm mb-1 block">Actor Photo URL (Imgur)</label>
          <input
            value={actorPhoto}
            onChange={(e) => setActorPhoto(e.target.value)}
            placeholder="https://i.imgur.com/..."
            className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-zinc-400 text-sm mb-1 block">Instagram URL</label>
          <input
            value={actorInstagram}
            onChange={(e) => setActorInstagram(e.target.value)}
            placeholder="https://www.instagram.com/username/"
            className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500"
          />
</div>
        </div>
      )}

      {/* Existing outfit dropdown */}
      {mode === 'existing' && (
        <div className="mb-6">
          <label className="text-zinc-400 text-sm mb-1 block">Select Outfit</label>
          <select
            value={selectedOutfitId}
            onChange={(e) => setSelectedOutfitId(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500"
          >
            <option value="">-- Select an outfit --</option>
            {existingOutfits.map((o) => (
              <option key={o.id} value={o.id}>
                {o.actors?.name} — {o.scene_description} ({o.shows?.title})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Upload */}
      <input type="file" accept="image/*" onChange={handleUpload} className="mb-4 text-zinc-400"/>

      {image && (
        <div className="mb-6">
          <img src={image} alt="preview" className="w-48 rounded-xl mb-4"/>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl"
          >
            {loading ? 'Analyzing...' : 'Analyze Outfit'}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8 mt-6">
          <div>
            <p className="text-white font-semibold text-lg">{result.scene_description}</p>
            <p className="text-purple-400 text-sm">{result.overall_style}</p>
          </div>

          {result.items?.map((item: any, i: number) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-white font-semibold mb-1">{item.item_type} — {item.color}</p>
              <p className="text-zinc-400 text-sm mb-4">{item.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {item.products?.map((product: any, j: number) => {
                  const productIndex = i * 10 + j
                  const isSaved = savedProducts.includes(productIndex)
                  return (
                    <div key={j} className={`bg-zinc-800 rounded-xl p-3 border ${isSaved ? 'border-green-500' : 'border-transparent'}`}>
                      <img src={product.image_url} alt={product.title} className="w-full h-32 object-cover rounded-lg mb-2"/>
                      <p className="text-white text-sm font-medium leading-tight mb-1">{product.title}</p>
                      <p className="text-purple-400 text-sm">{product.price}</p>
                      <p className="text-zinc-500 text-xs mb-3">{product.retailer}</p>
                      <div className="flex gap-2">
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:text-blue-300">
                          View →
                        </a>
                        <button
                          onClick={() => handleConfirmAndSave(item, product, productIndex)}
                          disabled={saving || isSaved}
                          className={`text-xs px-3 py-1 rounded-lg ${isSaved ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                        >
                          {isSaved ? '✓ Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function searchProduct(query: string) {
  const results = await getJson({
    engine: 'google_shopping',
    q: query,
    api_key: process.env.SERP_API_KEY,
    num: 8,
  })

  const items = results.shopping_results || []
  const filtered = items.filter((item: any) => {
    const source = item.source || ''
    const blocked = ['google', 'youtube']
    return !blocked.some(b => source.toLowerCase().includes(b))
  }).slice(0, 3)

  return filtered.map((item: any) => ({
    title: item.title,
    price: item.price || 'Check site',
    product_url: item.product_link || item.link || '',
    image_url: item.thumbnail || '',
    retailer: item.source || '',
  }))
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a fashion expert and personal stylist. Analyze this outfit image very carefully.
Return ONLY valid JSON, no markdown:
{
  "items": [
    {
      "item_type": "dress",
      "color": "exact color you see",
      "description": "detailed one sentence description including exact color, fabric, fit, neckline and style",
      "search_query": "exact color + fabric + style + fit + occasion for google shopping. Be very literal about what you see."
    }
  ],
  "overall_style": "glam/casual/beach/streetwear/formal",
  "scene_description": "short descriptive outfit name"
}
IMPORTANT: Be extremely literal. If the dress is red sequin, search for 'red sequin'. Do not generalize colors.`,
            },
            {
              type: 'image_url',
              image_url: { url: image }
            }
          ]
        }
      ],
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content || '{}'
    const cleaned = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const itemsWithProducts = await Promise.all(
      parsed.items.map(async (item: any) => {
        const products = await searchProduct(item.search_query)
        return { ...item, products }
      })
    )

    return NextResponse.json({
      ...parsed,
      items: itemsWithProducts,
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
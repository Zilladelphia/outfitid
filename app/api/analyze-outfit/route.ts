import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const RETAILER_WHITELIST = [
  'asos.com',
  'nordstrom.com',
  'revolve.com',
  'fashionnova.com',
  'prettylittlething.com',
  'ohpolly.com',
  'houseofcb.com',
  'meshki.com.au',
  'boohoo.com',
  'misguided.com',
  'shein.com',
  'zara.com',
  'hm.com',
  'nastygal.com',
  'urbanoutfitters.com',
  'shopbop.com',
  'bloomingdales.com',
  'macys.com',
  'amazon.com',
]

const SITE_FILTER = RETAILER_WHITELIST
  .slice(0, 5)
  .map(d => `site:${d}`)
  .join(' OR ')

async function searchProduct(query: string) {
  try {
    const results = await getJson({
      engine: 'google',
      q: `${query} ${SITE_FILTER}`,
      api_key: process.env.SERP_API_KEY,
      num: 10,
      gl: 'us',
      hl: 'en',
    })

    const organic = results.organic_results || []

    const scored = organic
      .map((item: any) => {
        const url: string = item.link || ''
        const domain = RETAILER_WHITELIST.find(d => url.includes(d))
        const score = domain ? RETAILER_WHITELIST.indexOf(domain) : 999
        const isProductPage =
          url.includes('/product') ||
          url.includes('/p/') ||
          url.includes('/dp/') ||
          url.includes('/item') ||
          url.includes('/shop') ||
          url.split('/').length > 4
        return { item, url, score, isProductPage, domain }
      })
      .filter(({ url, domain, isProductPage }: any) =>
        domain && isProductPage && url !== ''
      )
      .sort((a: any, b: any) => a.score - b.score)
      .slice(0, 3)

    return scored.map(({ item, url, domain }: any) => ({
      title: item.title,
      price: item.price || 'Check site',
      product_url: url,
      image_url: item.thumbnail || '',
      retailer: domain || item.displayed_link || '',
      match_type: 'similar',
    }))

  } catch (err: any) {
    console.error('searchProduct error:', err.message)
    return []
  }
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
              text: `You are a fashion expert. Analyze this outfit image carefully.
Return ONLY valid JSON, no markdown:
{
  "items": [
    {
      "item_type": "dress",
      "color": "exact color you see",
      "description": "detailed one sentence description including exact color, fabric, fit, neckline and style",
      "search_query": "women's [exact color] [fabric] [neckline] [item type]"
    }
  ],
  "overall_style": "glam/casual/beach/streetwear/formal",
  "scene_description": "short descriptive outfit name"
}
RULES:
- Be extremely literal about colors. Red is red, not multicolor.
- search_query must be 5-8 words max, no brand names
- Format: women's [color] [fabric] [neckline] [item type]
- Example: "women's red sequin halter neck maxi dress"
- Example: "women's black leather bodycon midi dress"`,
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
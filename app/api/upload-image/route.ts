import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File

    const imgurForm = new FormData()
    imgurForm.append('image', image)

    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: { Authorization: 'Client-ID 546c25a59c58ad7' },
      body: imgurForm,
    })

    const data = await res.json()
    return NextResponse.json({ url: data.data?.link || '' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
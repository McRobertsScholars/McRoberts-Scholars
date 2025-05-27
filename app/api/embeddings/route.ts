import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Call Mistral embeddings API
    const response = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-embed",
        input: [text],
      }),
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`)
    }

    const data = await response.json()
    const embedding = data.data[0].embedding

    return NextResponse.json({ embedding })
  } catch (error) {
    console.error("Embedding error:", error)
    return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 })
  }
}

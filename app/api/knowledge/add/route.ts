import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { chunkText, extractMetadata } from "@/lib/knowledge-processor"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(request: Request) {
  try {
    const { content, metadata = {} } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    console.log("Processing content:", content)

    // Chunk the content
    const chunks = chunkText(content)
    console.log("Generated chunks:", chunks)

    const results = []
    const errors = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Processing chunk ${i + 1}:`, chunk)

      try {
        // Extract metadata from chunk
        const chunkMetadata = {
          ...metadata,
          ...extractMetadata(chunk),
          chunk_size: chunk.length,
          chunk_index: i,
        }

        console.log("Chunk metadata:", chunkMetadata)

        // Store in database
        const { data, error } = await supabase
          .from("knowledge_base")
          .insert({
            content: chunk,
            metadata: chunkMetadata,
          })
          .select()

        if (error) {
          console.error(`Error inserting chunk ${i + 1}:`, error)
          errors.push({ chunk_index: i, error: error.message })
        } else {
          console.log(`Successfully inserted chunk ${i + 1}:`, data)
          results.push(data[0])
        }
      } catch (chunkError) {
        console.error(`Exception processing chunk ${i + 1}:`, chunkError)
        errors.push({ chunk_index: i, error: chunkError.message })
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      chunks_processed: chunks.length,
      chunks_stored: results.length,
      errors: errors.length > 0 ? errors : undefined,
      stored_data: results,
    })
  } catch (error) {
    console.error("Error adding knowledge:", error)
    return NextResponse.json(
      {
        error: "Failed to add knowledge",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

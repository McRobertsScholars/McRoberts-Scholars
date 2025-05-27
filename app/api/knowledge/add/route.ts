import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { chunkText, extractMetadata } from "@/lib/knowledge-processor"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface ErrorItem {
  chunk_index: number
  chunk_content: string
  error: string
  error_code?: string
  error_details?: any
  exception?: boolean
}

interface ApiResponse {
  success: boolean
  chunks_processed: number
  chunks_stored: number
  stored_data: any[]
  raw_chunks: string[]
  errors?: ErrorItem[]
}

export async function POST(request: Request) {
  try {
    const { content, metadata = {} } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    console.log("Processing content:", content)

    // Chunk the content
    const chunks = chunkText(content.trim())
    console.log("Generated chunks:", chunks)

    if (chunks.length === 0) {
      return NextResponse.json({ error: "No valid chunks generated from content" }, { status: 400 })
    }

    const results: any[] = []
    const errors: ErrorItem[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Processing chunk ${i + 1}:`, chunk)

      if (!chunk || !chunk.trim()) {
        console.log(`Skipping empty chunk ${i + 1}`)
        continue
      }

      try {
        // Extract metadata from chunk
        const chunkMetadata = {
          ...metadata,
          ...extractMetadata(chunk),
          chunk_size: chunk.length,
          chunk_index: i,
          processed_at: new Date().toISOString(),
        }

        console.log("Chunk metadata:", chunkMetadata)

        // Prepare the insert data
        const insertData = {
          content: chunk.trim(),
          metadata: chunkMetadata,
        }

        console.log("Insert data:", insertData)

        // Store in database
        const { data, error } = await supabase.from("knowledge_base").insert(insertData).select()

        if (error) {
          console.error(`Error inserting chunk ${i + 1}:`, error)
          errors.push({
            chunk_index: i,
            chunk_content: chunk,
            error: error.message,
            error_code: error.code,
            error_details: error,
          })
        } else {
          console.log(`Successfully inserted chunk ${i + 1}:`, data)
          results.push(data[0])
        }
      } catch (chunkError) {
        console.error(`Exception processing chunk ${i + 1}:`, chunkError)
        const errorMessage = chunkError instanceof Error ? chunkError.message : "Unknown error occurred"
        errors.push({
          chunk_index: i,
          chunk_content: chunk,
          error: errorMessage,
          exception: true,
        })
      }
    }

    const response: ApiResponse = {
      success: results.length > 0,
      chunks_processed: chunks.length,
      chunks_stored: results.length,
      stored_data: results,
      raw_chunks: chunks,
    }

    if (errors.length > 0) {
      response.errors = errors
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error adding knowledge:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: "Failed to add knowledge",
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 },
    )
  }
}

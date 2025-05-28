import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: Request) {
  let query: string | null = null
  try {
    const { searchParams } = new URL(request.url)
    query = searchParams.get("q") || "meeting"

    console.log("Testing knowledge base search for:", query)

    // Get all records first to see what we have
    const { data: allRecords, error: allError } = await supabase.from("knowledge_base").select("*").limit(10)

    if (allError) {
      console.error("Error fetching all records:", allError)
      return NextResponse.json({
        success: false,
        error: allError.message,
        query: query,
      })
    }

    console.log("Total records found:", allRecords?.length || 0)

    // Now search for specific content
    const queryLower = query.toLowerCase()
    const keywords = queryLower.split(" ").filter((word) => word.length > 3)

    console.log("Search keywords:", keywords)

    const matchingRecords =
      allRecords?.filter((record) => {
        const contentLower = record.content.toLowerCase()
        return keywords.some((keyword) => contentLower.includes(keyword))
      }) || []

    console.log("Matching records:", matchingRecords.length)

    return NextResponse.json({
      success: true,
      query: query,
      keywords: keywords,
      total_records: allRecords?.length || 0,
      matching_records: matchingRecords.length,
      all_records: allRecords?.map((r) => ({
        id: r.id,
        content_preview: r.content.substring(0, 100) + "...",
        metadata: r.metadata,
      })),
      matching_content: matchingRecords.map((r) => ({
        id: r.id,
        content: r.content,
        metadata: r.metadata,
      })),
    })
  } catch (error) {
    console.error("Search test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      query: query || "none",
    })
  }
}

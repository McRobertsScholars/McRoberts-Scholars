import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    // Try to select from the knowledge_base table
    const { data, error, count } = await supabase.from("knowledge_base").select("*", { count: "exact" }).limit(5)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Table exists with ${count} records`,
      sample_data: data,
      total_records: count,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(request: Request) {
  try {
    console.log("Checking knowledge_base table...")

    // Try to insert a test record to check if table exists and is writable
    const testData = {
      content: "Test content for table verification",
      metadata: { test: true, created_at: new Date().toISOString() },
    }

    const { data, error } = await supabase.from("knowledge_base").insert(testData).select()

    if (error) {
      console.error("Table check error:", error)

      if (error.code === "42P01") {
        return NextResponse.json({
          success: false,
          message: "Table 'knowledge_base' does not exist. Please create it in your Supabase dashboard.",
          error: error.message,
        })
      }

      return NextResponse.json({
        success: false,
        message: "Table exists but there's an issue with permissions or structure.",
        error: error.message,
      })
    }

    // Clean up test data
    if (data && data[0]) {
      await supabase.from("knowledge_base").delete().eq("id", data[0].id)
    }

    return NextResponse.json({
      success: true,
      message: "Knowledge base table exists and is working correctly!",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Setup failed",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

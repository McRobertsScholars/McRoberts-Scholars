import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      // No env configured -> return empty, no fallback data
      return NextResponse.json([])
    }

    const supabase = createClient(url, anon)
    const { data, error } = await supabase.from("scholarships").select("*")

    if (error) {
      console.error("Supabase scholarships error:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error("Error fetching scholarships:", err)
    return NextResponse.json([])
  }
}

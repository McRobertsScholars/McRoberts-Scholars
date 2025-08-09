import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      // No env configured -> return empty
      return NextResponse.json([])
    }

    const supabase = createClient(url, anon)
    const { data, error } = await supabase.from("resources").select("*")

    if (error) {
      console.error("Supabase resources error:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json([])
  }
}

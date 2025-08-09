// app/api/resources/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Fetch resources
    const { data, error } = await supabase
      .from("resources")
      .select("*")
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json([])
  }
}

// app/api/resources/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Supabase credentials are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return dummy data if no Supabase credentials
      return NextResponse.json([
        {
          id: "1",
          title: "Choosing the Right School: A Step-by-Step Guide",
          type: "slides",
          link: "https://example.com/guide",
          description: "A comprehensive guide to help you choose the right college."
        },
        {
          id: "2",
          title: "Founders Worksheet",
          type: "worksheet",
          link: "https://example.com/worksheet",
          description: "A worksheet to help you organize your college application process."
        },
        {
          id: "3",
          title: "Scholarship Application Tips",
          type: "video",
          link: "https://example.com/video",
          description: "Video tutorial on how to write effective scholarship applications."
        },
        {
          id: "4",
          title: "Financial Aid Resources",
          type: "document",
          link: "https://example.com/financial-aid",
          description: "Document with information about financial aid options."
        }
      ])
    }
    
    const { createClient } = require("@supabase/supabase-js")
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
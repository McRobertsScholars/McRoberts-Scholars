// app/api/scholarships/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Supabase credentials are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return dummy data if no Supabase credentials
      return NextResponse.json([
        {
          id: "1",
          name: "Toshiba ExploraVision National Science Competition",
          deadline: "January 31, 2026",
          amount: "$10,000",
          description: "Science competition for K-12 students",
          requirements: "Team of 2-4 students, teacher advisor required",
          link: "https://www.exploravision.org/",
          category: "science"
        },
        {
          id: "2",
          name: "Optimist International Oratorical Contest",
          deadline: "Varies by local club",
          amount: "Up to $2,500",
          description: "Speech contest for students under 19",
          requirements: "Speech on the designated topic, under 19 years old",
          link: "https://www.optimist.org/member/scholarships3.cfm",
          category: "speech"
        },
        {
          id: "3",
          name: "Fraser Institute Student Essay Contest",
          deadline: "June 1, 2025",
          amount: "$1,500",
          description: "Essay contest on economic principles",
          requirements: "High school and undergraduate students",
          link: "https://www.fraserinstitute.org/education-programs/students/essay-contest",
          category: "essay"
        },
        {
          id: "4",
          name: "SolidEssay Writing Contest",
          deadline: "June 9, 2025",
          amount: "$1,000",
          description: "Essay writing contest for students",
          requirements: "Currently enrolled students",
          link: "https://www.solidessay.com/essay-contest",
          category: "essay"
        }
      ])
    }
    
    const { createClient } = require("@supabase/supabase-js")
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // Fetch scholarships
    const { data, error } = await supabase
      .from("scholarships")
      .select("*")
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    return NextResponse.json([])
  }
}
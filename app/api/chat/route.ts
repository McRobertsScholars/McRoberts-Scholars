import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client with service role key for vector operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Function to get embeddings from Groq (since we're switching from Mistral)
async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    // For now, let's use a simple text search since Groq doesn't have embeddings API
    // We'll implement proper vector search once we get the embeddings working
    return null
  } catch (error) {
    console.error("Embedding error:", error)
    return null
  }
}

// Function to search knowledge base using vector similarity
async function searchKnowledgeBase(query: string, matchCount = 5): Promise<string> {
  try {
    console.log("Searching knowledge base for:", query)

    // For now, use text search until we get embeddings working
    let results = null
    const { data: searchResults, error } = await supabase
      .from("knowledge_base")
      .select("content, metadata")
      .textSearch("content", query)
      .limit(matchCount)

    if (error) {
      console.error("Knowledge base search error:", error)
      // Fallback to simple text matching
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from("knowledge_base")
        .select("content, metadata")
        .ilike("content", `%${query}%`)
        .limit(matchCount)

      if (fallbackError) {
        console.error("Fallback search error:", fallbackError)
        return ""
      }

      results = fallbackResults
    }

    if (!results || results.length === 0) {
      console.log("No knowledge base results found")
      return ""
    }

    console.log(`Found ${results.length} relevant knowledge chunks`)
    return results.map((result) => result.content).join("\n\n")
  } catch (error) {
    console.error("Knowledge base search error:", error)
    return ""
  }
}

export async function POST(request: Request) {
  try {
    console.log("Chat API called")

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content
    console.log("User message:", userMessage)

    // Search knowledge base for relevant information
    console.log("Searching knowledge base...")
    const relevantKnowledge = await searchKnowledgeBase(userMessage)
    console.log("Knowledge found:", relevantKnowledge ? "Yes" : "No")

    // Fetch scholarships from Supabase
    const { data: scholarships } = await supabase.from("scholarships").select("*")

    // Fetch resources from Supabase
    const { data: resources } = await supabase.from("resources").select("*")

    // Format data for the AI
    const formattedScholarships = scholarships
      ? scholarships
          .map(
            (s) =>
              `${s.name}\nDeadline: ${s.deadline}\nAmount: ${s.amount}\nDescription: ${s.description}\nEligibility: ${s.eligibility || s.requirements || "Not specified"}\nLink: ${s.link}`,
          )
          .join("\n\n")
      : ""

    const formattedResources = resources ? resources.map((r) => `${r.title} (${r.type}): ${r.link}`).join("\n\n") : ""

    // Create system message with all context
    const systemMessage = `You are an AI assistant for McRoberts Scholars, a student club that helps peers find and apply for scholarships.

KNOWLEDGE BASE INFORMATION:
${relevantKnowledge}

AVAILABLE SCHOLARSHIPS:
${formattedScholarships}

AVAILABLE RESOURCES:
${formattedResources}

CLUB INFORMATION:
- Weekly meetings: Wednesdays 3:00-4:30 PM in Student Center Room 204
- Discord: https://discord.gg/j8SP6zxraN
- Email: mcrobertsscholars@gmail.com

Always provide helpful, accurate responses based on the information above. Use markdown formatting with ## for headings and **bold** for emphasis. Include relevant links when appropriate.`

    // Check if Groq API key exists and is valid
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 20) {
      console.error("Invalid or missing Groq API key")
      return NextResponse.json(
        {
          error: "AI service unavailable - API key not configured properly",
        },
        { status: 500 },
      )
    }

    // Prepare messages for Groq
    const aiMessages = [
      { role: "system", content: systemMessage },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
    ]

    console.log("Calling Groq API...")

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Groq API error:", response.status, errorText)
      return NextResponse.json(
        {
          error: `AI service error: ${response.status}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid Groq response structure")
      return NextResponse.json(
        {
          error: "Invalid AI response",
        },
        { status: 500 },
      )
    }

    const responseContent = data.choices[0].message.content

    console.log("Groq response received successfully")
    return NextResponse.json({ content: responseContent })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client with service role key for vector operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Function to search knowledge base using text search
async function searchKnowledgeBase(query: string, matchCount = 5): Promise<string> {
  try {
    console.log("Searching knowledge base for:", query)

    // Use text search with keywords
    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 3)

    let results = null

    // Try different search approaches
    for (const keyword of keywords) {
      const { data: searchResults, error } = await supabase
        .from("knowledge_base")
        .select("content, metadata")
        .ilike("content", `%${keyword}%`)
        .limit(matchCount)

      if (!error && searchResults && searchResults.length > 0) {
        results = searchResults
        break
      }
    }

    // If no keyword matches, get some general content
    if (!results || results.length === 0) {
      const { data: generalResults, error } = await supabase.from("knowledge_base").select("content, metadata").limit(3)

      if (!error) {
        results = generalResults
      }
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
- Discord: https://discord.gg/j8SP6zxraN
- Email: mcrobertsscholars@gmail.com

Always provide helpful, accurate responses based on the information above. Use markdown formatting with ## for headings and **bold** for emphasis. Include relevant links when appropriate.`

    // Check if Groq API key exists
    if (!process.env.GROQ_API_KEY) {
      console.error("Missing Groq API key")
      return NextResponse.json(
        {
          error: "AI service unavailable - API key not configured",
        },
        { status: 500 },
      )
    }

    // Prepare messages for Groq
    const aiMessages = [
      { role: "system", content: systemMessage },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
    ]

    console.log("Calling Groq API with model: llama-3.1-70b-versatile")

    // Call Groq API with correct model names
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile", // Using a known working Groq model
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 0.9,
        stream: false,
      }),
    })

    console.log("Groq API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Groq API error:", response.status, errorText)

      // Try with a different model if the first one fails
      console.log("Trying with alternative model: llama3-8b-8192")

      const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Alternative model
          messages: aiMessages,
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9,
          stream: false,
        }),
      })

      if (!fallbackResponse.ok) {
        const fallbackErrorText = await fallbackResponse.text()
        console.error("Fallback model also failed:", fallbackResponse.status, fallbackErrorText)
        return NextResponse.json(
          {
            error: `AI service error: ${response.status} - ${errorText}`,
          },
          { status: 500 },
        )
      }

      const fallbackData = await fallbackResponse.json()
      if (!fallbackData.choices || !fallbackData.choices[0] || !fallbackData.choices[0].message) {
        return NextResponse.json(
          {
            error: "Invalid AI response structure",
          },
          { status: 500 },
        )
      }

      const responseContent = fallbackData.choices[0].message.content
      console.log("Fallback model response received successfully")
      return NextResponse.json({ content: responseContent })
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid Groq response structure:", data)
      return NextResponse.json(
        {
          error: "Invalid AI response structure",
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

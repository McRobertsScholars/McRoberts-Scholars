import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Function to search knowledge base using simple text matching
async function searchKnowledgeBase(query: string, matchCount = 5): Promise<string> {
  try {
    // Convert query to lowercase for case-insensitive search
    const queryLower = query.toLowerCase()

    // Extract keywords from the query
    const keywords = queryLower
      .split(" ")
      .filter((word) => word.length > 3)
      .map((word) => word.replace(/[.,?!;:()]/g, ""))

    // Search for content that contains any of the keywords
    const { data: results, error } = await supabase.from("knowledge_base").select("content, metadata").limit(50) // Get more results to filter through

    if (error) {
      console.error("Error searching knowledge base:", error)
      return ""
    }

    if (!results || results.length === 0) {
      return ""
    }

    // Score each result based on keyword matches
    const scoredResults = results.map((result) => {
      const contentLower = result.content.toLowerCase()
      const score = keywords.reduce((total, keyword) => {
        return total + (contentLower.includes(keyword) ? 1 : 0)
      }, 0)
      return { ...result, score }
    })

    // Sort by score and take top results
    const topResults = scoredResults
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, matchCount)

    // Combine the relevant chunks
    const relevantInfo = topResults.map((result) => result.content).join("\n\n")

    return relevantInfo
  } catch (error) {
    console.error("Knowledge base search error:", error)
    return ""
  }
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content

    // Fetch scholarships from Supabase
    const { data: scholarships, error: scholarshipsError } = await supabase.from("scholarships").select("*")

    if (scholarshipsError) {
      console.error("Error fetching scholarships:", scholarshipsError)
      return NextResponse.json({ error: "Failed to fetch scholarships" }, { status: 500 })
    }

    // Fetch resources from Supabase
    const { data: resources, error: resourcesError } = await supabase.from("resources").select("*")

    if (resourcesError) {
      console.error("Error fetching resources:", resourcesError)
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
    }

    // Format scholarships for the AI
    const formattedScholarships = scholarships
      ? scholarships
          .map(
            (scholarship) =>
              `${scholarship.name}\nDeadline: ${scholarship.deadline}\nAmount: ${scholarship.amount}\nDescription: ${scholarship.description}\nEligibility: ${scholarship.eligibility}\nMore Information: ${scholarship.link}`,
          )
          .join("\n\n")
      : "No scholarships available at this time."

    // Format resources for the AI
    const formattedResources = resources
      ? resources.map((resource) => `${resource.title} (${resource.type}): ${resource.link}`).join("\n\n")
      : "No resources available at this time."

    // Search knowledge base for relevant information
    const relevantKnowledge = await searchKnowledgeBase(userMessage)

    // Create system message with context
    const systemMessage = `
You are an AI assistant for McRoberts Scholars, designed to help students with scholarship information.
Always be helpful, accurate, and concise. Format your responses with markdown headings and lists when appropriate.

Here is information about available scholarships:
${formattedScholarships}

Here are available resources:
${formattedResources}

${relevantKnowledge ? `Here is additional relevant information from our knowledge base:\n${relevantKnowledge}` : ""}

When asked about meetings, inform users that scholarship information sessions are held every Wednesday from 3:00 PM to 4:30 PM in the Student Center, Room 204.

When recommending scholarships, always explain why they might be a good fit for the student.

Always answer all parts of multi-part questions.

IMPORTANT FORMATTING INSTRUCTIONS:
1. When you want to emphasize text, use **bold** format.
2. When listing scholarships, format them as numbered list items with the following structure:
   1. **Scholarship Name** - **Deadline:** Date - **Amount:** Amount - **Why it might be a good fit:** Explanation - **More Information:** [Link Text](URL)
3. Make sure all links are properly formatted as markdown links: [Link Text](URL)
`.trim()

    // Prepare messages for Mistral
    const aiMessages = [
      { role: "system", content: systemMessage },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
    ]

    // Call Mistral API
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Mistral API error:", errorData)
      throw new Error(`Mistral API error: ${response.status}`)
    }

    const data = await response.json()
    const responseContent = data.choices[0].message.content || "Sorry, I could not generate a response."

    return NextResponse.json({ content: responseContent })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

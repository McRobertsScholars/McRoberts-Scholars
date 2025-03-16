import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Read knowledge base file
const knowledgeBasePath = path.join(process.cwd(), "data", "knowledge.txt")
let knowledgeBase = ""

try {
  if (fs.existsSync(knowledgeBasePath)) {
    knowledgeBase = fs.readFileSync(knowledgeBasePath, "utf8")
  } else {
    console.warn("Knowledge base file not found at:", knowledgeBasePath)
  }
} catch (error) {
  console.error("Error reading knowledge base file:", error)
}

// Function to extract relevant information from knowledge base
function extractRelevantInfo(query: string, knowledgeBase: string): string {
  // Split the knowledge base into chunks
  const chunks = knowledgeBase.split("\n\n")

  // Convert query to lowercase for case-insensitive matching
  const queryLower = query.toLowerCase()

  // Keywords to look for
  const keywords = queryLower
    .split(" ")
    .filter((word) => word.length > 3) // Only consider words longer than 3 characters
    .map((word) => word.replace(/[.,?!;:()]/g, "")) // Remove punctuation

  // Score each chunk based on keyword matches
  const scoredChunks = chunks.map((chunk) => {
    const chunkLower = chunk.toLowerCase()
    const score = keywords.reduce((total, keyword) => {
      return total + (chunkLower.includes(keyword) ? 1 : 0)
    }, 0)
    return { chunk, score }
  })

  // Sort chunks by score (highest first)
  scoredChunks.sort((a, b) => b.score - a.score)

  // Take the top 5 chunks or fewer if there aren't that many
  const relevantChunks = scoredChunks
    .filter((item) => item.score > 0) // Only include chunks with at least one keyword match
    .slice(0, 5)
    .map((item) => item.chunk)

  // Join the relevant chunks
  return relevantChunks.join("\n\n")
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

    // Extract relevant information from the knowledge base
    const relevantInfo = extractRelevantInfo(userMessage, knowledgeBase)

    // Create system message with context
    const systemMessage = `
You are an AI assistant for McRoberts Scholars, designed to help students with scholarship information.
Always be helpful, accurate, and concise. Format your responses with markdown headings and lists when appropriate.

Here is information about available scholarships:
${formattedScholarships}

Here are available resources:
${formattedResources}

Here is additional relevant information:
${relevantInfo}

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
        model: "mistral-large-latest", // or whichever model you prefer
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


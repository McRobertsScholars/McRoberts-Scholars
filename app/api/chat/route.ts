import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Function to search knowledge base using simple text matching
async function searchKnowledgeBase(query: string, matchCount = 5): Promise<string> {
  try {
    console.log("Searching knowledge base for:", query)

    // Convert query to lowercase for case-insensitive search
    const queryLower = query.toLowerCase()

    // Extract keywords from the query
    const keywords = queryLower
      .split(" ")
      .filter((word) => word.length > 3)
      .map((word) => word.replace(/[.,?!;:()]/g, ""))

    console.log("Keywords extracted:", keywords)

    // Search for content that contains any of the keywords
    const { data: results, error } = await supabase.from("knowledge_base").select("content, metadata").limit(50)

    if (error) {
      console.error("Error searching knowledge base:", error)
      return ""
    }

    if (!results || results.length === 0) {
      console.log("No knowledge base results found")
      return ""
    }

    console.log(`Found ${results.length} knowledge base entries`)

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

    console.log(`Using ${topResults.length} relevant knowledge chunks`)

    // Combine the relevant chunks
    const relevantInfo = topResults.map((result) => result.content).join("\n\n")

    return relevantInfo
  } catch (error) {
    console.error("Knowledge base search error:", error)
    return ""
  }
}

// Fallback responses for common questions
function getFallbackResponse(userMessage: string): string {
  const messageLower = userMessage.toLowerCase()

  if (messageLower.includes("meeting") || messageLower.includes("when")) {
    return "## Meeting Information\n\nMcRoberts Scholars holds scholarship information sessions every **Wednesday from 3:00 PM to 4:30 PM** in the **Student Center, Room 204**.\n\n### What We Cover\n- Scholarship opportunities\n- Application strategies\n- Essay writing tips\n- Interview preparation\n\n### How to Join\nJoin our Discord server for updates: https://discord.gg/j8SP6zxraN"
  }

  if (messageLower.includes("scholarship") || messageLower.includes("apply")) {
    return "## Available Scholarships\n\nHere are some current scholarship opportunities:\n\n### 1. **Toshiba ExploraVision National Science Competition**\n- **Deadline:** January 31, 2026\n- **Amount:** $10,000\n- **Description:** Science competition for K-12 students\n- **Requirements:** Team of 2-4 students, teacher advisor required\n- **More Information:** [Apply Here](https://www.exploravision.org/)\n\n### 2. **Optimist International Oratorical Contest**\n- **Deadline:** Varies by local club\n- **Amount:** Up to $2,500\n- **Description:** Speech contest for students under 19\n- **Requirements:** Speech on designated topic, under 19 years old\n- **More Information:** [Learn More](https://www.optimist.org/member/scholarships3.cfm)\n\n### Need Help?\nJoin our Discord for personalized assistance: https://discord.gg/j8SP6zxraN"
  }

  if (messageLower.includes("writing") || messageLower.includes("essay")) {
    return "## Creative Writing Tips\n\n### **Start with a Strong Hook**\nBegin your essay with an engaging opening that captures the reader's attention.\n\n### **Show, Don't Tell**\nUse specific examples and vivid details rather than general statements.\n\n### **Be Authentic**\nWrite in your own voice and share genuine experiences.\n\n### **Structure Your Ideas**\n- Introduction with clear thesis\n- Body paragraphs with supporting evidence\n- Strong conclusion that ties everything together\n\n### **Edit and Revise**\n- Read your work aloud\n- Check for grammar and spelling\n- Get feedback from others\n\n### Need More Help?\nJoin our Discord for writing workshops and feedback: https://discord.gg/j8SP6zxraN"
  }

  return "## McRoberts Scholars Assistant\n\nI'm here to help with scholarship information! I can assist with:\n\n### **Scholarship Opportunities**\n- Current available scholarships\n- Application deadlines\n- Eligibility requirements\n\n### **Application Support**\n- Essay writing tips\n- Interview preparation\n- Application strategies\n\n### **Meeting Information**\n- Weekly sessions: Wednesdays 3:00-4:30 PM\n- Location: Student Center, Room 204\n\n### **Get Connected**\nJoin our Discord community: https://discord.gg/j8SP6zxraN\n\nFeel free to ask me specific questions about scholarships, applications, or our program!"
}

export async function POST(request: Request) {
  try {
    console.log("Chat API called")
    console.log("Environment check:")
    console.log("- GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)
    console.log("- SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("- SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content
    console.log("User message:", userMessage)

    // If no Groq API key, use fallback response
    if (!process.env.GROQ_API_KEY) {
      console.log("No Groq API key found, using fallback response")
      const fallbackContent = getFallbackResponse(userMessage)
      return NextResponse.json({ content: fallbackContent })
    }

    // Fetch scholarships from Supabase
    console.log("Fetching scholarships...")
    const { data: scholarships, error: scholarshipsError } = await supabase.from("scholarships").select("*")

    if (scholarshipsError) {
      console.error("Error fetching scholarships:", scholarshipsError)
      // Continue without scholarships rather than failing
    }

    // Fetch resources from Supabase
    console.log("Fetching resources...")
    const { data: resources, error: resourcesError } = await supabase.from("resources").select("*")

    if (resourcesError) {
      console.error("Error fetching resources:", resourcesError)
      // Continue without resources rather than failing
    }

    // Format scholarships for the AI
    const formattedScholarships = scholarships
      ? scholarships
          .map(
            (scholarship) =>
              `${scholarship.name}\nDeadline: ${scholarship.deadline}\nAmount: ${scholarship.amount}\nDescription: ${scholarship.description}\nEligibility: ${scholarship.eligibility || scholarship.requirements || "Not specified"}\nMore Information: ${scholarship.link}`,
          )
          .join("\n\n")
      : "No scholarships available at this time."

    // Format resources for the AI
    const formattedResources = resources
      ? resources.map((resource) => `${resource.title} (${resource.type}): ${resource.link}`).join("\n\n")
      : "No resources available at this time."

    // Search knowledge base for relevant information
    console.log("Searching knowledge base...")
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
4. Use clear headings with ## for main sections
5. Use ### for subsections that should be expandable
`.trim()

    // Prepare messages for Groq
    const aiMessages = [
      { role: "system", content: systemMessage },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
    ]

    console.log("Calling Groq API...")

    try {
      // Call Groq API with timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768", // Fast and capable model
          messages: aiMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Groq API error:", response.status, errorText)

        // Use fallback response if Groq API fails
        console.log("Groq API failed, using fallback response")
        const fallbackContent = getFallbackResponse(userMessage)
        return NextResponse.json({ content: fallbackContent })
      }

      const data = await response.json()
      console.log("Groq API response received successfully")

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid Groq API response structure:", data)

        // Use fallback response if response structure is invalid
        console.log("Invalid Groq response structure, using fallback")
        const fallbackContent = getFallbackResponse(userMessage)
        return NextResponse.json({ content: fallbackContent })
      }

      const responseContent = data.choices[0].message.content || "Sorry, I could not generate a response."

      console.log("Sending Groq response to client")
      return NextResponse.json({ content: responseContent })
    } catch (groqError) {
      console.error("Groq API call failed:", groqError)

      // Use fallback response if Groq completely fails
      console.log("Groq API completely failed, using fallback response")
      const fallbackContent = getFallbackResponse(userMessage)
      return NextResponse.json({ content: fallbackContent })
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    // Even if everything fails, provide a basic response
    const userMessage = "general help"
    const fallbackContent = getFallbackResponse(userMessage)

    return NextResponse.json({ content: fallbackContent })
  }
}

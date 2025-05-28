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

export async function POST(request: Request) {
  try {
    console.log("=== Chat API called ===")
    console.log("Environment check:")
    console.log("- GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)
    console.log("- GROQ_API_KEY length:", process.env.GROQ_API_KEY?.length || 0)
    console.log("- SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("- SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content
    console.log("User message:", userMessage)

    // Search knowledge base for relevant information FIRST
    console.log("=== Searching knowledge base ===")
    const relevantKnowledge = await searchKnowledgeBase(userMessage)
    console.log("Knowledge base results:", relevantKnowledge ? "Found content" : "No content found")
    if (relevantKnowledge) {
      console.log("Knowledge content preview:", relevantKnowledge.substring(0, 200) + "...")
    }

    // Fetch scholarships from Supabase
    console.log("=== Fetching scholarships ===")
    const { data: scholarships, error: scholarshipsError } = await supabase.from("scholarships").select("*")

    if (scholarshipsError) {
      console.error("Error fetching scholarships:", scholarshipsError)
    } else {
      console.log("Scholarships found:", scholarships?.length || 0)
    }

    // Fetch resources from Supabase
    console.log("=== Fetching resources ===")
    const { data: resources, error: resourcesError } = await supabase.from("resources").select("*")

    if (resourcesError) {
      console.error("Error fetching resources:", resourcesError)
    } else {
      console.log("Resources found:", resources?.length || 0)
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
2. Use clear headings with ## for main sections.
3. Use bullet points with - for lists.
4. Make sure all links are properly formatted as markdown links: [Link Text](URL)
5. Provide detailed, helpful content - don't just give section titles.
6. When giving tips or advice, provide the actual content, not just headings.
`.trim()

    // Check if we should use Groq API
    const useGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10
    console.log("=== API Decision ===")
    console.log("Will use Groq API:", useGroq)

    if (!useGroq) {
      console.log("Using fallback response (no valid Groq API key)")

      // Create a response using available data
      let response = "## McRoberts Scholars Assistant\n\n"

      if (userMessage.toLowerCase().includes("writing") || userMessage.toLowerCase().includes("essay")) {
        response += `## Creative Writing Tips

**Start with a Strong Hook**
Begin your essay with an engaging opening that captures the reader's attention. This could be a compelling question, an interesting fact, or a personal anecdote.

**Show, Don't Tell**
Use specific examples and vivid details rather than general statements. Instead of saying "I'm a leader," describe a specific situation where you demonstrated leadership.

**Be Authentic**
Write in your own voice and share genuine experiences. Admissions committees can tell when writing feels forced or fake.

**Structure Your Ideas**
- Introduction with clear thesis
- Body paragraphs with supporting evidence  
- Strong conclusion that ties everything together

**Edit and Revise**
- Read your work aloud to catch awkward phrasing
- Check for grammar and spelling errors
- Get feedback from teachers, counselors, or peers
- Make sure you're answering the prompt directly

**Keep It Focused**
Stay on topic and make every sentence count. Most scholarship essays have word limits, so make each word meaningful.

## Need More Help?
Join our Discord community for writing workshops and personalized feedback: https://discord.gg/j8SP6zxraN

We also hold weekly meetings every Wednesday from 3:00 PM to 4:30 PM in the Student Center, Room 204.`
      } else if (userMessage.toLowerCase().includes("meeting") || userMessage.toLowerCase().includes("when")) {
        response += `## Meeting Information

McRoberts Scholars holds scholarship information sessions every **Wednesday from 3:00 PM to 4:30 PM** in the **Student Center, Room 204**.

## What We Cover
- Current scholarship opportunities
- Application strategies and deadlines
- Essay writing workshops
- Interview preparation tips
- Peer support and feedback

## How to Stay Connected
Join our Discord server for updates and community support: https://discord.gg/j8SP6zxraN

## Contact Information
Email us at: mcrobertsscholars@gmail.com`
      } else {
        response += `I can help you with scholarship information, application tips, and more!

## Available Scholarships
${formattedScholarships}

## Resources
${formattedResources}

${relevantKnowledge ? `## Additional Information\n${relevantKnowledge}` : ""}

## Weekly Meetings
Join us every Wednesday from 3:00 PM to 4:30 PM in the Student Center, Room 204.

## Stay Connected
Discord: https://discord.gg/j8SP6zxraN
Email: mcrobertsscholars@gmail.com`
      }

      return NextResponse.json({ content: response })
    }

    // Prepare messages for Groq
    const aiMessages = [
      { role: "system", content: systemMessage },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
    ]

    try {
      console.log("=== Calling Groq API ===")
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("Groq API response status:", groqResponse.status)

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text()
        console.error("Groq API error details:", errorText)
        throw new Error(`Groq API error: ${groqResponse.status} - ${errorText}`)
      }

      const data = await groqResponse.json()
      console.log("Groq API response received successfully")
      console.log("Response preview:", data.choices?.[0]?.message?.content?.substring(0, 100) + "...")

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid Groq API response structure:", JSON.stringify(data, null, 2))
        throw new Error("Invalid Groq API response structure")
      }

      const responseContent = data.choices[0].message.content || "Sorry, I could not generate a response."

      console.log("=== Sending Groq response to client ===")
      return NextResponse.json({ content: responseContent })
    } catch (groqError) {
      console.error("=== Groq API call failed ===")
      console.error("Error details:", groqError)

      // Fallback to basic response if Groq fails
      const fallbackResponse = `## McRoberts Scholars Assistant

I'm experiencing some technical difficulties, but I can still help with basic information!

## Available Scholarships
${formattedScholarships}

## Resources  
${formattedResources}

${relevantKnowledge ? `## Additional Information\n${relevantKnowledge}` : ""}

## Weekly Meetings
Every Wednesday from 3:00 PM to 4:30 PM in the Student Center, Room 204.

## Get Connected
- Discord: https://discord.gg/j8SP6zxraN
- Email: mcrobertsscholars@gmail.com

For more detailed help, please try again in a moment or join our Discord community!`

      return NextResponse.json({ content: fallbackResponse })
    }
  } catch (error) {
    console.error("Error in chat API:", error)

    return NextResponse.json({
      content:
        "## Technical Difficulties\n\nI'm experiencing some issues right now. Please try again in a moment, or join our Discord for immediate help: https://discord.gg/j8SP6zxraN\n\nYou can also email us at mcrobertsscholars@gmail.com",
    })
  }
}

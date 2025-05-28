import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing Groq API configuration...")

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "GROQ_API_KEY environment variable is not set",
        hasKey: false,
        keyLength: 0,
      })
    }

    if (apiKey.length < 10) {
      return NextResponse.json({
        success: false,
        message: "GROQ_API_KEY appears to be too short",
        hasKey: true,
        keyLength: apiKey.length,
      })
    }

    // Test a simple API call
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: "Say 'Hello, this is a test!'" }],
        max_tokens: 50,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        message: "Groq API call failed",
        status: response.status,
        error: errorText,
        hasKey: true,
        keyLength: apiKey.length,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Groq API is working correctly",
      hasKey: true,
      keyLength: apiKey.length,
      testResponse: data.choices?.[0]?.message?.content || "No response content",
    })
  } catch (error) {
    console.error("Groq test error:", error)
    return NextResponse.json({
      success: false,
      message: "Error testing Groq API",
      error: error instanceof Error ? error.message : "Unknown error",
      hasKey: !!process.env.GROQ_API_KEY,
      keyLength: process.env.GROQ_API_KEY?.length || 0,
    })
  }
}

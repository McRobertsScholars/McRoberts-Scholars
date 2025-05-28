import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "GROQ_API_KEY not found",
      })
    }

    // Test different Groq models
    const modelsToTest = [
      "llama-3.1-70b-versatile",
      "llama3-8b-8192",
      "llama3-70b-8192",
      "mixtral-8x7b-32768",
      "gemma-7b-it",
      "qwen-qwq-32b",
    ]

    const results = []

    for (const model of modelsToTest) {
      try {
        console.log(`Testing model: ${model}`)

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Say 'Hello from " + model + "'" }],
            max_tokens: 50,
            temperature: 0.1,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            model: model,
            status: "✅ Working",
            response: data.choices?.[0]?.message?.content || "No content",
          })
        } else {
          const errorText = await response.text()
          results.push({
            model: model,
            status: `❌ Failed (${response.status})`,
            error: errorText,
          })
        }
      } catch (error) {
        results.push({
          model: model,
          status: "❌ Error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      apiKeyLength: apiKey.length,
      results: results,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

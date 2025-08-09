"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Loader2, Send } from "lucide-react"
import TypingAnimation from "@/components/TypingAnimation"
import ExpandableSection from "@/components/ExpandableSection"

type Message = {
  role: string
  content: string
}

export default function AIAssistant() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentTypingMessage, setCurrentTypingMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom()
    }
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isTyping) return

    setIsLoading(true)
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      setIsTyping(true)
      setCurrentTypingMessage(data.content)
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypingComplete = () => {
    setMessages((prev) => {
      const newMessages = [...prev]
      newMessages[newMessages.length - 1].content = currentTypingMessage
      return newMessages
    })
    setIsTyping(false)
    setCurrentTypingMessage("")
  }

  const identifySections = (content: string) => {
    const sectionRegex = /### ([^\n]+)\n([\s\S]*?)(?=\n### |$)/g
    const matches = [...content.matchAll(sectionRegex)]
    if (matches.length > 0) {
      return matches.map((match) => ({ title: match[1].trim(), content: match[2].trim() }))
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[#111827] px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-4">McRoberts Scholars AI Assistant (Admin)</h1>

        <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            This AI assistant is designed to help with scholarship information, but it may occasionally make mistakes.
            Please verify important information through official sources.
          </AlertDescription>
        </Alert>

        <div className="gradient-border glow">
          <div className="bg-[#111827] rounded-[0.6rem]">
            <div className="h-[600px] overflow-y-auto p-6 space-y-4 rounded-t-[0.6rem] custom-scroll">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
                  <div className="mb-4">
                    <Info className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
                  <p className="max-w-md">
                    Ask me about scholarships, application processes, deadlines, or any other questions related to
                    McRoberts Scholars.
                  </p>
                </div>
              )}

              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1

                return (
                  <div
                    key={index}
                    className={`max-w-[90%] rounded-lg ${
                      message.role === "user"
                        ? "ml-auto bg-blue-600 text-white p-4"
                        : "mr-auto bg-[#111827] text-white p-5"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      isLastMessage && isTyping ? (
                        <div className="prose prose-sm max-w-none prose-invert">
                          <TypingAnimation text={currentTypingMessage} onComplete={handleTypingComplete} />
                        </div>
                      ) : (
                        <div className="text-white">
                          {identifySections(message.content) ? (
                            <div>
                              {identifySections(message.content)!.map((section, sectionIndex) => (
                                <ExpandableSection key={sectionIndex} title={section.title}>
                                  <div className="text-white">{section.content}</div>
                                </ExpandableSection>
                              ))}
                            </div>
                          ) : (
                            <div>{message.content}</div>
                          )}
                        </div>
                      )
                    ) : (
                      message.content
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-700 p-4 bg-[#111827] flex gap-2 rounded-b-[0.6rem]"
            >
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about scholarships..."
                className="flex-grow text-white bg-[#1a2235] border-gray-700 p-3 rounded-lg placeholder:text-gray-400"
                disabled={isLoading || isTyping}
              />
              <Button
                type="submit"
                disabled={isLoading || isTyping}
                className="bg-blue-600 text-white hover:bg-blue-700 p-3"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="ml-2 hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

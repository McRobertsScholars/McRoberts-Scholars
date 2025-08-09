"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import SectionHero from "@/components/section-hero"
import SectionSeparator from "@/components/section-separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ChevronRight, ExternalLink, Info, Loader2, Send, AlertCircle } from "lucide-react"

const ExpandableSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <div className="mb-4 gradient-border glow">
      <div className="rounded-[0.6rem] overflow-hidden bg-[#111827]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1a2235] transition-colors"
        >
          <h3 className="text-md font-medium text-white">{title}</h3>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-white" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white" />
          )}
        </button>
        {isExpanded && <div className="p-4 text-white">{children}</div>}
      </div>
    </div>
  )
}

const TypingAnimation = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 3)
      return () => clearTimeout(timeout)
    } else {
      onComplete()
    }
  }, [currentIndex, text, onComplete])
  return <div className="whitespace-pre-wrap">{displayedText}</div>
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  const processBoldText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2)
        return (
          <strong key={i} className="font-semibold text-accent">
            {boldText}
          </strong>
        )
      }
      return part
    })
  }
  const processLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
    const parts = text.split(linkRegex)
    const result = []
    for (let i = 0; i < parts.length; i += 3) {
      if (parts[i]) result.push(processBoldText(parts[i]))
      if (parts[i + 1] && parts[i + 2]) {
        result.push(
          <a
            key={i}
            href={parts[i + 2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-secondary underline inline-flex items-center"
          >
            {parts[i + 1]}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>,
        )
      }
    }
    return result.length > 0 ? result : processBoldText(text)
  }
  const clean = (content || "").trim()
  if (!clean) return <div className="text-gray-400">No content to display</div>
  const sections = clean.split(/\n\n+/)
  return (
    <div className="prose prose-sm max-w-none prose-invert">
      {sections.map((section, index) => {
        const s = section.trim()
        if (!s) return null
        if (s.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-bold mt-6 mb-4 text-white">
              {processLinks(s.replace("## ", ""))}
            </h2>
          )
        }
        if (s.startsWith("### ")) {
          return (
            <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-accent">
              {processLinks(s.replace("### ", ""))}
            </h3>
          )
        }
        if (s.match(/^\d+\.\s/)) {
          const items = s.split(/\n(?=\d+\.)/)
          return (
            <ol key={index} className="list-decimal pl-5 my-4 space-y-2 text-white">
              {items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {processLinks(item.replace(/^\d+\.\s*/, ""))}
                </li>
              ))}
            </ol>
          )
        }
        if (s.match(/^[-•]\s/m)) {
          const items = s.split(/\n(?=[-•]\s)/)
          return (
            <ul key={index} className="list-disc pl-5 my-4 space-y-2 text-white">
              {items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {processLinks(item.replace(/^[-•]\s*/, ""))}
                </li>
              ))}
            </ul>
          )
        }
        return (
          <div key={index} className="mb-4 text-white leading-relaxed">
            {processLinks(s)}
          </div>
        )
      })}
    </div>
  )
}

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
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => {
    if (!isTyping) scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isTyping) return
    setIsLoading(true)
    setError(null)
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
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      const data = await response.json()
      setIsTyping(true)
      setCurrentTypingMessage(data.content)
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `## Error\n\nSorry, I encountered an error: ${errorMessage}\n\nPlease try again.`,
        },
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

  return (
    <div className="bg-[#111827]">
      <SectionHero title="AI Assistant" subtitle="Ask anything about scholarships, deadlines, or resources" />
      <SectionSeparator />

      <div className="px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
            <Info className="h-4 w-4 mr-2" />
            <AlertDescription>
              This AI assistant uses our knowledge base to help with scholarship information. Please verify important
              details through official sources.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert className="mb-6 bg-red-900 border-red-700">
              <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
              <AlertDescription className="text-white">{error}</AlertDescription>
            </Alert>
          )}

          <div className="gradient-border glow">
            <div className="bg-[#111827] rounded-[0.6rem]">
              <div className="h-[600px] overflow-y-auto custom-scroll p-6 space-y-4 rounded-t-[0.6rem]">
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
                      className={`max-w-[90%] rounded-lg ${message.role === "user" ? "ml-auto bg-blue-600 text-white p-4" : "mr-auto bg-[#1a2235] text-white p-5"}`}
                    >
                      {message.role === "assistant" ? (
                        isLastMessage && isTyping ? (
                          <div className="text-white">
                            <TypingAnimation text={currentTypingMessage} onComplete={handleTypingComplete} />
                          </div>
                        ) : (
                          <div className="text-white">
                            <MarkdownRenderer content={message.content} />
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
    </div>
  )
}

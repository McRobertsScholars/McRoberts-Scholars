"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, ChevronRight, ExternalLink, Info, Loader2, Send } from "lucide-react"

// Component for expandable sections
const ExpandableSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-4 gradient-border">
      <div className="rounded-lg overflow-hidden bg-[#111827]">
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

// Component for typing animation
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

// Enhanced markdown renderer
const MarkdownRenderer = ({ content }: { content: string }) => {
  // Process bold text (** **)
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

  // Process links [text](url)
  const processLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
    const parts = text.split(linkRegex)
    const result = []

    for (let i = 0; i < parts.length; i += 3) {
      if (parts[i]) {
        result.push(processBoldText(parts[i]))
      }
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

  // Process the content
  const processContent = () => {
    if (!content || !content.trim()) {
      return <div className="text-gray-400">No content to display</div>
    }

    // Clean up the content
    const cleanContent = content
      .replace(/^#+\s*$/gm, "") // Remove lines with only # symbols
      .replace(/^\s*#\s*$/gm, "") // Remove lines with only # and whitespace
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
      .trim()

    if (!cleanContent) {
      return <div className="text-gray-400">No content to display</div>
    }

    // Split content by double newlines to separate sections
    const sections = cleanContent.split(/\n\n+/)

    return sections
      .map((section, index) => {
        // Skip empty sections
        if (!section.trim()) return null

        // Clean the section
        const cleanSection = section.trim()

        // Check if this is a main heading (## )
        if (cleanSection.startsWith("## ")) {
          const title = cleanSection.replace("## ", "").trim()
          return (
            <h2 key={index} className="text-2xl font-bold mt-6 mb-4 text-white">
              {processLinks(title)}
            </h2>
          )
        }

        // Check if this is a subheading (### ) - render as expandable section
        if (cleanSection.startsWith("### ")) {
          const title = cleanSection.replace("### ", "").trim()
          return (
            <ExpandableSection key={index} title={title}>
              <div className="text-white">More details about {title}</div>
            </ExpandableSection>
          )
        }

        // Check if this looks like a section with content (starts with **text** on its own line)
        const lines = cleanSection.split("\n")
        if (lines.length > 1 && lines[0].match(/^\*\*[^*]+\*\*$/)) {
          const title = lines[0].replace(/^\*\*|\*\*$/g, "")
          const content = lines.slice(1).join("\n").trim()

          if (content) {
            return (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold text-accent mb-2">{title}</h3>
                <div className="text-white leading-relaxed">{processTextContent(content)}</div>
              </div>
            )
          }
        }

        // Process numbered lists
        if (cleanSection.match(/^\d+\.\s/)) {
          const items = cleanSection.split(/\n(?=\d+\.)/)
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

        // Process bullet lists
        if (cleanSection.match(/^[-•]\s/m)) {
          const items = cleanSection.split(/\n(?=[-•]\s)/)
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

        // Default paragraph
        return (
          <div key={index} className="mb-4 text-white leading-relaxed">
            {processLinks(cleanSection)}
          </div>
        )
      })
      .filter(Boolean) // Remove null entries
  }

  // Process text content within sections
  const processTextContent = (text: string) => {
    const lines = text.split("\n")
    return lines
      .map((line, i) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return null

        if (trimmedLine.match(/^[-•]\s/)) {
          return (
            <div key={i} className="ml-4 mb-1">
              • {processLinks(trimmedLine.replace(/^[-•]\s*/, ""))}
            </div>
          )
        }
        return (
          <div key={i} className="mb-2">
            {processLinks(trimmedLine)}
          </div>
        )
      })
      .filter(Boolean)
  }

  return <div className="prose prose-sm max-w-none prose-invert">{processContent()}</div>
}

// Type for message
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

  // Scroll to bottom of messages
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
      // Send the message to our API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Start typing animation
      setIsTyping(true)
      setCurrentTypingMessage(data.content)

      // Add empty assistant message that will be filled by typing animation
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle typing completion
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
    <div className="min-h-screen bg-[#111827] px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-4">McRoberts Scholars AI Assistant</h1>

        <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            This AI assistant is designed to help with scholarship information, but it may occasionally make mistakes.
            Please verify important information through official sources.
          </AlertDescription>
        </Alert>

        <div className="gradient-border">
          <div className="bg-[#111827] rounded-lg">
            <div className="h-[600px] overflow-y-auto p-6 space-y-4 rounded-t-lg">
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
                        : "mr-auto bg-[#1a2235] text-white p-5"
                    }`}
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

            <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4 bg-[#111827] flex gap-2">
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

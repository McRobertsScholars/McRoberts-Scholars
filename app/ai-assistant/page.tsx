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

// Component for scholarship card
const ScholarshipCard = ({
  name,
  deadline,
  amount,
  description,
  eligibility,
  link,
}: {
  name: string
  deadline: string
  amount: string
  description: string
  eligibility: string
  link: string
}) => {
  return (
    <div className="mb-4 gradient-border">
      <div className="p-4 rounded-lg bg-[#111827] text-white">
        <h4 className="text-lg font-semibold text-white mb-2">{name}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="flex items-center">
            <span className="font-medium mr-2">Deadline:</span> {deadline}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Amount:</span> {amount}
          </div>
        </div>
        <p className="mb-2">{description}</p>
        <p className="mb-3">
          <span className="font-medium">Eligibility:</span> {eligibility}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center bg-transparent border-white text-white hover:bg-white/10"
          onClick={() => window.open(link, "_blank")}
        >
          More Information
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
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
      }, 3) // Speed of typing - even faster (was 7)

      return () => clearTimeout(timeout)
    } else {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  return <div>{displayedText}</div>
}

// Custom markdown renderer
const MarkdownRenderer = ({ content }: { content: string }) => {
  // Process the content to identify different parts
  const processContent = () => {
    // Split content by double newlines to separate sections
    const sections = content.split(/\n\n+/)

    return sections.map((section, index) => {
      // Check if this section is a scholarship
      if (
        section.match(
          /^(.*?)\nDeadline: (.*?)\nAmount: (.*?)\nDescription: ([\s\S]*?)(?:\nEligibility: ([\s\S]*?))?(?:\nMore Information: ([\s\S]*?))?$/,
        )
      ) {
        const match = section.match(
          /^(.*?)\nDeadline: (.*?)\nAmount: (.*?)\nDescription: ([\s\S]*?)(?:\nEligibility: ([\s\S]*?))?(?:\nMore Information: ([\s\S]*?))?$/,
        )
        if (match) {
          const [, name, deadline, amount, description, eligibility = "Not specified", link = "#"] = match

          return (
            <ScholarshipCard
              key={index}
              name={name}
              deadline={deadline}
              amount={amount}
              description={description}
              eligibility={eligibility}
              link={link}
            />
          )
        }
      }

      // Check if this is a numbered list with scholarships
      if (section.match(/^\d+\.\s+\*\*([^*]+)\*\*/)) {
        // This is a scholarship list item
        return (
          <div key={index} className="mb-4 gradient-border">
            <div className="p-4 rounded-lg bg-[#111827] text-white">{processScholarshipListItem(section)}</div>
          </div>
        )
      }

      // Check if this is a heading
      if (section.startsWith("## ")) {
        const title = section.replace("## ", "")
        return (
          <h2 key={index} className="text-xl font-bold mt-6 mb-4 text-white">
            {title}
          </h2>
        )
      }

      // Check if this is a subheading
      if (section.startsWith("### ")) {
        const title = section.replace("### ", "")
        return (
          <h3 key={index} className="text-lg font-semibold mt-4 mb-3 text-white">
            {title}
          </h3>
        )
      }

      // Process lists
      if (section.match(/^- /m)) {
        const items = section.split(/\n- /)
        return (
          <ul key={index} className="list-disc pl-5 my-3 space-y-1 text-white">
            {items.filter(Boolean).map((item, i) => (
              <li key={i}>{processBoldText(item.replace(/^- /, ""))}</li>
            ))}
          </ul>
        )
      }

      // Default paragraph
      return (
        <p key={index} className="mb-4 text-white">
          {processBoldText(section)}
        </p>
      )
    })
  }

  // Process bold text (** **)
  const processBoldText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2)
        return <strong key={i}>{boldText}</strong>
      }
      return part
    })
  }

  // Process scholarship list items with links
  const processScholarshipListItem = (text: string) => {
    // Extract scholarship details using regex
    const nameMatch = text.match(/\d+\.\s+\*\*([^*]+)\*\*/)
    const deadlineMatch = text.match(/\*\*Deadline:\*\*\s+([^-]+)/)
    const amountMatch = text.match(/\*\*Amount:\*\*\s+([^-]+)/)
    const fitMatch = text.match(/\*\*Why it might be a good fit:\*\*\s+(.*?)(?=\s+-\s+\*\*More Information|$)/s)
    const linkTextMatch = text.match(/\*\*More Information:\*\*\s+\[(.*?)\]/)
    const linkUrlMatch = text.match(/$$(https?:\/\/[^)]+)$$/)

    const name = nameMatch ? nameMatch[1] : "Scholarship"
    const deadline = deadlineMatch ? deadlineMatch[1].trim() : ""
    const amount = amountMatch ? amountMatch[1].trim() : ""
    const fit = fitMatch ? fitMatch[1].trim() : ""
    const linkText = linkTextMatch ? linkTextMatch[1] : "More Information"
    const linkUrl = linkUrlMatch ? linkUrlMatch[1] : "#"

    return (
      <>
        <h4 className="text-lg font-semibold text-white mb-2">{name}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="flex items-center">
            <span className="font-medium mr-2">Deadline:</span> {deadline}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Amount:</span> {amount}
          </div>
        </div>
        <p className="mb-3">
          <span className="font-medium mr-2">Why it might be a good fit:</span> {fit}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center bg-transparent border-white text-white hover:bg-white/10"
          onClick={() => window.open(linkUrl, "_blank")}
        >
          {linkText}
          <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </>
    )
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

  // Identify sections in the message content for expandable sections
  const identifySections = (content: string) => {
    // Using [\s\S] instead of the 's' flag for cross-line matching
    const sectionRegex = /## (.*?)(?=\n## |$)/g

    // We need to handle multiline matching differently without the 's' flag
    // First, get all the section titles
    const sectionTitles = [...content.matchAll(/## ([^\n]+)/g)].map((match) => match[1].trim())

    if (sectionTitles.length > 0) {
      // Split the content by section headers
      const sections = content.split(/## [^\n]+\n/)
      // Remove the first empty element if it exists
      if (!sections[0].trim()) sections.shift()

      return sectionTitles.map((title, index) => {
        return {
          title,
          content: sections[index] || "",
        }
      })
    }

    return null
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
                          {/* Check if we can identify sections for expandable content */}
                          {identifySections(message.content) ? (
                            <div>
                              {identifySections(message.content)!.map((section, sectionIndex) => (
                                <ExpandableSection key={sectionIndex} title={section.title}>
                                  <MarkdownRenderer content={section.content} />
                                </ExpandableSection>
                              ))}
                            </div>
                          ) : (
                            <MarkdownRenderer content={message.content} />
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


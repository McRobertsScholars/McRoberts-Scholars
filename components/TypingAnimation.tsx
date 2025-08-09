"use client"

import { useEffect, useState } from "react"

export default function TypingAnimation({
  text,
  onComplete,
  speed = 3,
}: {
  text: string
  onComplete: () => void
  speed?: number
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      onComplete()
    }
  }, [currentIndex, text, onComplete, speed])

  return <div className="whitespace-pre-wrap">{displayedText}</div>
}

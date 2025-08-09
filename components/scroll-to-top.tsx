"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-40 rounded-full bg-accent text-[hsl(222.2,47.4%,11.2%)] p-3 shadow-lg hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-foreground md:bottom-6"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

export default function Reveal({ children, className, delay = 0, y = 16, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transition: "transform 700ms ease-out, opacity 700ms ease-out, filter 700ms ease-out",
        transform: visible ? "translate3d(0,0,0)" : `translate3d(0, ${y}px, 0)`,
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0px)" : "blur(2px)",
        willChange: "transform, opacity, filter",
      }}
      className={className}
    >
      {children}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import type { JSX } from "react/jsx-runtime"

type StaggerTextProps = {
  text: string
  className?: string
  delayStep?: number
  startDelay?: number
  as?: keyof JSX.IntrinsicElements
}

export default function StaggerText({ text, className, delayStep = 60, startDelay = 0, as = "h1" }: StaggerTextProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const words = text.split(" ")

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const Tag = as as any

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          style={{
            display: "inline-block",
            transform: visible ? "translateY(0px)" : "translateY(12px)",
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0px)" : "blur(2px)",
            transition: `transform 600ms cubic-bezier(.2,.8,.2,1) ${startDelay + i * delayStep}ms, opacity 600ms ease ${
              startDelay + i * delayStep
            }ms, filter 600ms ease ${startDelay + i * delayStep}ms`,
            willChange: "transform, opacity, filter",
            whiteSpace: "pre",
          }}
        >
          {w + (i < words.length - 1 ? " " : "")}
        </span>
      ))}
    </Tag>
  )
}

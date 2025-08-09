"use client"

import { useEffect, useRef, useState } from "react"
import type React from "react"

type HeroParallaxProps = {
  children: React.ReactNode
}

export default function HeroParallax({ children }: HeroParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = (e.clientX - cx) / (rect.width / 2) // -1..1
      const ny = (e.clientY - cy) / (rect.height / 2)
      setMouse({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) })
    }

    const onScroll = () => setScrollY(window.scrollY)

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // Depth utility
  const t = (depth: number) => `translate3d(${mouse.x * depth}px, ${mouse.y * depth + scrollY * depth * 0.05}px, 0)`

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Code-generated background: layered gradients + grid, no raster image */}
      <div className="hero-coded pointer-events-none" aria-hidden="true" />

      {/* Parallax decorative blobs */}
      <div
        className="pointer-events-none absolute -top-28 -left-24 h-80 w-80 rounded-full bg-lightYellowLime/30 blur-3xl"
        style={{ transform: t(10) }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-goldOrange/25 blur-3xl"
        style={{ transform: t(14) }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_60%)]"
        style={{ transform: t(6) }}
        aria-hidden="true"
      />

      {/* Content layer */}
      <div className="relative z-10 container mx-auto px-4 py-14 md:py-24">{children}</div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/scholarships", label: "Scholarships" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/resources", label: "Resources" },
]

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      const h = document.documentElement
      const total = h.scrollHeight - h.clientHeight
      const p = total > 0 ? (h.scrollTop / total) * 100 : 0
      setProgress(p)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors backdrop-blur supports-[backdrop-filter]:bg-background/75 ${
        scrolled ? "bg-background/90 shadow-lg" : "bg-background/50"
      }`}
      style={{ height: "64px" }}
    >
      {/* scroll progress bar */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[2px] bg-[linear-gradient(90deg,#2f5c7e,#c5d86d,#e6a65d)]"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
      <div className="h-full px-6 md:px-8">
        <div className="container mx-auto h-full flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight">
            McRoberts Scholars
          </Link>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-1">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-4 py-2 rounded-full text-sm transition-colors ${
                    active ? "text-white" : "text-white/75 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  <span
                    className={`pointer-events-none absolute left-2 right-2 -bottom-0.5 h-[2px] rounded-full bg-[linear-gradient(90deg,#2f5c7e,#c5d86d,#e6a65d)] transition-opacity ${
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </nav>

          {/* CTA */}
          <a
            href="https://linktr.ee/McrobertsScholars?fbclid=PAZXh0bgNhZW0CMTEAAac_mSbfhSoBnG2y74-Bwj8RNoOtjQ_rmM_StrlZqB25heHUPHJgqz3vtrD_FQ_aem_Btgsmh7SZn9LnXHJQStKTQ"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Linktree"
            className="hidden md:block"
          >
            <Button className="bg-accent text-accent-foreground hover:bg-opacity-90">
              <Link2 className="mr-2 h-4 w-4" />
              Linktree
            </Button>
          </a>

          {/* mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* gradient hairline at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden px-6 md:px-8 pb-3" id="mobile-nav">
          <nav className="container mx-auto flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md ${pathname === item.href ? "bg-white/10 text-white" : "text-white/80 hover:text-white"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://linktr.ee/McrobertsScholars?fbclid=PAZXh0bgNhZW0CMTEAAac_mSbfhSoBnG2y74-Bwj8RNoOtjQ_rmM_StrlZqB25heHUPHJgqz3vtrD_FQ_aem_Btgsmh7SZn9LnXHJQStKTQ"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="px-3 py-2 rounded-md bg-accent text-accent-foreground"
            >
              Linktree
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

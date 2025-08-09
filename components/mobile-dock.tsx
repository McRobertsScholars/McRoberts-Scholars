"use client"

import Link from "next/link"
import { GraduationCap, Bot, Link2 } from "lucide-react"

export default function MobileDock() {
  return (
    <nav aria-label="Quick actions" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <div className="rounded-full border border-gray-700 bg-[#1a2235]/90 backdrop-blur px-3 py-2 shadow-lg">
        <ul className="flex items-center gap-2">
          <li>
            <Link
              href="/scholarships"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Scholarships</span>
            </Link>
          </li>
          <li>
            <Link
              href="/ai-assistant"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Bot className="h-4 w-4" />
              <span>AI Assistant</span>
            </Link>
          </li>
          <li>
            <a
              href="https://linktr.ee/McrobertsScholars?fbclid=PAZXh0bgNhZW0CMTEAAac_mSbfhSoBnG2y74-Bwj8RNoOtjQ_rmM_StrlZqB25heHUPHJgqz3vtrD_FQ_aem_Btgsmh7SZn9LnXHJQStKTQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Link2 className="h-4 w-4" />
              <span>Linktree</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

export default function ExpandableSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen)

  return (
    <div className="mb-4 gradient-border glow">
      <div className="rounded-[0.6rem] overflow-hidden bg-[#111827]">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1a2235] transition-colors"
          aria-expanded={isExpanded}
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

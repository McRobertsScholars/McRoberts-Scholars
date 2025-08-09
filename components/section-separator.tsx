"use client"

export default function SectionSeparator({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-10 ${className}`} aria-hidden="true" role="presentation">
      {/* hairline glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* brand gradient band */}
      <div className="absolute inset-x-16 top-1/2 -translate-y-1/2 h-2 rounded-full blur-md opacity-70 bg-[linear-gradient(90deg,#2f5c7e,#c5d86d,#e6a65d)]" />
      {/* soft fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/0 to-transparent" />
    </div>
  )
}

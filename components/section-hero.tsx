"use client"

import StaggerText from "@/components/stagger-text"

export default function SectionHero({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-coded pointer-events-none" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-28 -left-24 h-56 w-56 rounded-full bg-lightYellowLime/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-goldOrange/20 blur-3xl" />
      <div className="relative z-10 container mx-auto px-4 py-10 md:py-14">
        <StaggerText
          text={title}
          as="h1"
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm"
          startDelay={50}
          delayStep={50}
        />
        {subtitle ? (
          <StaggerText
            text={subtitle}
            as="p"
            className="mt-3 text-base md:text-xl text-lightYellowLime drop-shadow-sm max-w-3xl"
            startDelay={500}
            delayStep={20}
          />
        ) : null}
      </div>
    </section>
  )
}

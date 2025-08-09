import Link from "next/link"
import Image from "next/image"
import Reveal from "@/components/reveal"
import StaggerText from "@/components/stagger-text"
import HeroParallax from "@/components/hero-parallax"
import SectionSeparator from "@/components/section-separator"
import { ArrowRight, Sparkles, BookOpen, MessageCircle } from "lucide-react"

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <HeroParallax>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="md:w-1/2 text-center md:text-left">
            <StaggerText
              text="McRoberts Scholars"
              as="h1"
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm"
              startDelay={50}
              delayStep={60}
            />
            <StaggerText
              text="Empowering students with scholarship opportunities"
              as="p"
              className="mt-4 text-lg md:text-2xl text-lightYellowLime drop-shadow-sm"
              startDelay={600}
              delayStep={24}
            />
            <Reveal delay={900}>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center md:justify-start">
                <Link
                  href="/scholarships"
                  className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-lg shadow-goldOrange/20 ring-1 ring-white/10 transition hover:bg-accent/90"
                >
                  Explore Scholarships
                  <ArrowRight className="ml-2" />
                </Link>
                <a
                  href="https://linktr.ee/McrobertsScholars?fbclid=PAZXh0bgNhZW0CMTEAAac_mSbfhSoBnG2y74-Bwj8RNoOtjQ_rmM_StrlZqB25heHUPHJgqz3vtrD_FQ_aem_Btgsmh7SZn9LnXHJQStKTQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white/10 px-6 py-3 text-base font-medium text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
                >
                  Linktree
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal className="md:w-1/2 flex justify-center" delay={150} y={24}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-tealBlue/50 via-lightYellowLime/40 to-goldOrange/40 blur-2xl" />
              <Image
                src="/Untitled_enhanced.png"
                alt="McRoberts Scholars Logo"
                width={360}
                height={360}
                className="relative z-10 rounded-full bg-white/90 p-3 shadow-2xl ring-1 ring-black/5"
                priority
              />
            </div>
          </Reveal>
        </div>
      </HeroParallax>

      {/* Smooth transition to content */}
      <SectionSeparator />

      {/* FEATURES */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Reveal delay={0}>
            <div className="gradient-border glow">
              <div className="p-6 bg-zinc-900 rounded-xl">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-8 h-8 text-accent" />
                  <h2 className="text-2xl font-semibold ml-3 text-white">Scholarships</h2>
                </div>
                <p className="text-zinc-200 mb-4">
                  Discover and apply for a wide range of scholarships tailored for McRoberts students.
                </p>
                <Link href="/scholarships" className="text-accent font-semibold hover:text-secondary transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="gradient-border glow">
              <div className="p-6 bg-zinc-900 rounded-xl">
                <div className="flex items-center mb-4">
                  <MessageCircle className="w-8 h-8 text-accent" />
                  <h2 className="text-2xl font-semibold ml-3 text-white">AI Assistant</h2>
                </div>
                <p className="text-zinc-200 mb-4">
                  Get instant answers to your questions about scholarships and applications.
                </p>
                <Link href="/ai-assistant" className="text-accent font-semibold hover:text-secondary transition-colors">
                  Chat Now
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="gradient-border glow">
              <div className="p-6 bg-zinc-900 rounded-xl">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 text-accent" />
                  <h2 className="text-2xl font-semibold ml-3 text-white">Resources</h2>
                </div>
                <p className="text-zinc-200 mb-4">
                  Access meeting videos, guides, and other helpful content for your scholarship journey.
                </p>
                <Link href="/resources" className="text-accent font-semibold hover:text-secondary transition-colors">
                  View Resources
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Blend to CTA */}
      <SectionSeparator />

      {/* CTA */}
      <Reveal>
        <section className="py-16 bg-[hsl(217.2,32.6%,17.5%)]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-6 text-white">Join Our Community</h2>
            <p className="text-xl text-secondary mb-8">
              Connect with fellow scholars and stay updated on the latest opportunities.
            </p>
            <a
              href="https://linktr.ee/McrobertsScholars?fbclid=PAZXh0bgNhZW0CMTEAAac_mSbfhSoBnG2y74-Bwj8RNoOtjQ_rmM_StrlZqB25heHUPHJgqz3vtrD_FQ_aem_Btgsmh7SZn9LnXHJQStKTQ"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition duration-300 inline-flex items-center group shadow-xl shadow-goldOrange/20 ring-1 ring-white/10"
            >
              Open Linktree
              <ArrowRight className="ml-2" />
            </a>
          </div>
        </section>
      </Reveal>
    </div>
  )
}

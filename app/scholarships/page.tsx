"use client"

import { useState, useEffect } from "react"
import Reveal from "@/components/reveal"
import SectionHero from "@/components/section-hero"
import SectionSeparator from "@/components/section-separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, FileText, ExternalLink, Search, Clock, Loader2 } from "lucide-react"

type Scholarship = {
  id: string
  name: string
  deadline: string
  amount: string
  description: string
  requirements: string
  link: string
  category?: string
}

export default function Scholarships() {
  const [searchTerm, setSearchTerm] = useState("")
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function fetchScholarships() {
      try {
        setLoading(true)
        const response = await fetch("/api/scholarships")
        if (!response.ok) throw new Error("Failed to fetch scholarships")
        const data = await response.json()
        setScholarships(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error:", error)
        // No fallback data — keep empty
        setScholarships([])
      } finally {
        setLoading(false)
      }
    }
    fetchScholarships()
  }, [])

  const categories = ["all", ...Array.from(new Set(scholarships.map((s) => s.category || "other")))]

  const filteredScholarships = scholarships.filter((scholarship) => {
    const matchesSearch =
      scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filter === "all" || scholarship.category === filter || (!scholarship.category && filter === "other")
    return matchesSearch && matchesFilter
  })

  const isDeadlineApproaching = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 14
  }

  if (loading) {
    return (
      <>
        <SectionHero title="Available Scholarships" subtitle="Filter and discover opportunities" />
        <SectionSeparator />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white">Loading scholarships...</h2>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SectionHero title="Available Scholarships" subtitle="Filter and discover opportunities tailored for you" />
      <SectionSeparator />

      <div className="container mx-auto px-4 py-8">
        <Reveal delay={0}>
          <div className="mb-8 gradient-border glow">
            <div className="p-1 bg-card rounded-[0.6rem]">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === category ? "bg-primary text-white" : "bg-muted text-foreground"
                      } capitalize`}
                      onClick={() => setFilter(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {filteredScholarships.length === 0 ? (
          <Reveal>
            <div className="text-center py-12 bg-card rounded-lg gradient-border glow">
              <div className="p-6 rounded-[0.6rem]">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">No scholarships found</h2>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((scholarship) => (
              <Reveal key={scholarship.id} delay={50}>
                <div className="gradient-border glow">
                  <div className="bg-card p-6 rounded-[0.6rem] h-full flex flex-col">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{scholarship.name}</h3>
                      {scholarship.category && (
                        <span className="inline-block px-2 py-1 bg-muted text-foreground text-xs rounded-full capitalize mb-2">
                          {scholarship.category}
                        </span>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Deadline: {scholarship.deadline}</span>
                        {isDeadlineApproaching(scholarship.deadline) && (
                          <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Approaching
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-lg font-semibold mb-3 text-accent">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {scholarship.amount}
                    </div>

                    <p className="text-sm mb-4">{scholarship.description}</p>

                    <div className="bg-muted p-3 rounded-md mb-4">
                      <h4 className="text-sm font-medium mb-1">Requirements:</h4>
                      <p className="text-xs text-muted-foreground">{scholarship.requirements}</p>
                    </div>

                    <div className="mt-auto">
                      <Button
                        className="w-full bg-accent text-accent-foreground hover:bg-opacity-90"
                        onClick={() => window.open(scholarship.link, "_blank")}
                      >
                        <span>Apply Now</span>
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

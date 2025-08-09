"use client"
import { useEffect, useState } from "react"
import Reveal from "@/components/reveal"
import SectionHero from "@/components/section-hero"
import SectionSeparator from "@/components/section-separator"
import { Button } from "@/components/ui/button"
import { Link2, ExternalLink, Loader2, FileText, Video, BookOpen } from "lucide-react"

type Resource = {
  id: string
  title: string
  type: string
  link: string
  description?: string
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [resourceTypes, setResourceTypes] = useState<string[]>(["all"])

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/resources")
        if (!response.ok) throw new Error("Failed to fetch resources")
        const data = await response.json()
        setResources(data)

        const uniqueTypes = new Set<string>()
        data.forEach((resource: Resource) => {
          if (resource.type) uniqueTypes.add(resource.type.toLowerCase())
        })
        const types = ["all", ...Array.from(uniqueTypes)]
        setResourceTypes(types)
      } catch (error) {
        console.error("Error fetching resources:", error)
        setResources([])
        setResourceTypes(["all"])
      } finally {
        setLoading(false)
      }
    }
    fetchResources()
  }, [])

  const filteredResources =
    activeTab === "all" ? resources : resources.filter((r) => r.type.toLowerCase() === activeTab)

  const getResourceIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    switch (lowerType) {
      case "video":
        return <Video className="h-5 w-5" />
      case "document":
      case "slides":
      case "worksheet":
        return <FileText className="h-5 w-5" />
      case "guide":
        return <BookOpen className="h-5 w-5" />
      default:
        return <Link2 className="h-5 w-5" />
    }
  }

  return (
    <>
      <SectionHero title="Resources" subtitle="Browse videos, guides, and more from our club" />
      <SectionSeparator />

      <div className="container mx-auto max-w-6xl px-4 pb-12">
        <Reveal delay={0}>
          <div className="mb-8 gradient-border glow">
            <div className="rounded-[0.6rem] bg-card p-4">
              <div className="flex overflow-x-auto pb-2">
                {resourceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-4 py-2 mr-2 rounded-md capitalize ${
                      activeTab === type ? "bg-primary text-white" : "bg-background text-foreground"
                    } transition-colors`}
                  >
                    {type === "all" ? "All" : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Reveal key={resource.id} delay={50}>
                <div className="gradient-border glow">
                  <div className="bg-card p-6 rounded-[0.6rem] h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      {getResourceIcon(resource.type)}
                      <h3 className="text-lg font-semibold">{resource.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Type: {resource.type}</p>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                    )}
                    <div className="mt-auto">
                      <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-opacity-90">
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <span>View Resource</span>
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="text-center py-12 bg-card rounded-lg gradient-border glow">
              <div className="p-6 rounded-[0.6rem]">
                <p className="text-xl text-muted-foreground">No resources available in this category.</p>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </>
  )
}

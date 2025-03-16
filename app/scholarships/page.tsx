// app/scholarships/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, FileText, ExternalLink, Search, Clock, Loader2 } from 'lucide-react'

// Define the type for each scholarship
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
        // Use API route instead of direct Supabase access
        const response = await fetch('/api/scholarships')
        if (!response.ok) {
          throw new Error('Failed to fetch scholarships')
        }
        const data = await response.json()
        setScholarships(data)
      } catch (error) {
        console.error("Error:", error)
        // Set some dummy data if fetch fails
        setScholarships([
          {
            id: "1",
            name: "Toshiba ExploraVision National Science Competition",
            deadline: "January 31, 2026",
            amount: "$10,000",
            description: "Science competition for K-12 students",
            requirements: "Team of 2-4 students, teacher advisor required",
            link: "https://www.exploravision.org/",
            category: "science"
          },
          {
            id: "2",
            name: "Optimist International Oratorical Contest",
            deadline: "Varies by local club",
            amount: "Up to $2,500",
            description: "Speech contest for students under 19",
            requirements: "Speech on the designated topic, under 19 years old",
            link: "https://www.optimist.org/member/scholarships3.cfm",
            category: "speech"
          },
          {
            id: "3",
            name: "Fraser Institute Student Essay Contest",
            deadline: "June 1, 2025",
            amount: "$1,500",
            description: "Essay contest on economic principles",
            requirements: "High school and undergraduate students",
            link: "https://www.fraserinstitute.org/education-programs/students/essay-contest",
            category: "essay"
          },
          {
            id: "4",
            name: "SolidEssay Writing Contest",
            deadline: "June 9, 2025",
            amount: "$1,000",
            description: "Essay writing contest for students",
            requirements: "Currently enrolled students",
            link: "https://www.solidessay.com/essay-contest",
            category: "essay"
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchScholarships()
  }, [])

  // Get all unique categories
  const categories = ["all", ...Array.from(new Set(scholarships.map(s => s.category || "other")))]

  // Filter scholarships based on the search term and category filter
  const filteredScholarships = scholarships.filter((scholarship) => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scholarship.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "all" || scholarship.category === filter || 
                          (!scholarship.category && filter === "other")
    
    return matchesSearch && matchesFilter
  })

  // Function to check if a deadline is approaching (within 14 days)
  const isDeadlineApproaching = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 14
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white">Loading scholarships...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Available Scholarships</h1>
      
      <div className="mb-8 bg-card p-6 rounded-lg shadow-md">
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
                  filter === category 
                    ? "bg-primary text-white" 
                    : "bg-muted text-foreground"
                } capitalize`}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {filteredScholarships.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No scholarships found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <div key={scholarship.id} className="rounded-lg overflow-hidden" style={{
              background: "linear-gradient(45deg, #2f5c7e, #c5d86d, #e6a65d)",
              padding: "2px"
            }}>
              <div className="bg-card p-6 rounded-lg h-full flex flex-col">
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
          ))}
        </div>
      )}
    </div>
  )
}
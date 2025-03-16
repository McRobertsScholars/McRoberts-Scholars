// app/resources/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, Loader2 } from 'lucide-react';

type Resource = {
  id: string;
  title: string;
  type: string;
  link: string;
  description?: string;
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        // Fetch from API instead of directly from Supabase
        const response = await fetch('/api/resources');
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
        // Set some dummy data if fetch fails
        setResources([
          {
            id: "1",
            title: "Choosing the Right School: A Step-by-Step Guide",
            type: "slides",
            link: "#"
          },
          {
            id: "2",
            title: "Founders Worksheet",
            type: "worksheet",
            link: "#"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Filter resources based on active tab
  const filteredResources = activeTab === "all" 
    ? resources 
    : resources.filter(resource => resource.type.toLowerCase() === activeTab);

  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    return <Link2 className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-6 text-white">Resources</h1>
        
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2">
            <button 
              onClick={() => setActiveTab("all")} 
              className={`px-4 py-2 mr-2 rounded-md ${activeTab === "all" ? "bg-primary text-white" : "bg-card text-foreground"}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab("video")} 
              className={`px-4 py-2 mr-2 rounded-md ${activeTab === "video" ? "bg-primary text-white" : "bg-card text-foreground"}`}
            >
              Videos
            </button>
            <button 
              onClick={() => setActiveTab("document")} 
              className={`px-4 py-2 mr-2 rounded-md ${activeTab === "document" ? "bg-primary text-white" : "bg-card text-foreground"}`}
            >
              Documents
            </button>
            <button 
              onClick={() => setActiveTab("guide")} 
              className={`px-4 py-2 mr-2 rounded-md ${activeTab === "guide" ? "bg-primary text-white" : "bg-card text-foreground"}`}
            >
              Guides
            </button>
            <button 
              onClick={() => setActiveTab("link")} 
              className={`px-4 py-2 rounded-md ${activeTab === "link" ? "bg-primary text-white" : "bg-card text-foreground"}`}
            >
              Links
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="rounded-lg overflow-hidden" style={{
                background: "linear-gradient(45deg, #2f5c7e, #c5d86d, #e6a65d)",
                padding: "2px"
              }}>
                <div className="bg-card p-6 rounded-lg h-full flex flex-col">
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
                      <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                        <span>View Resource</span>
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-xl text-muted-foreground">No resources available in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
// app/resources/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, Loader2, FileText, Video, BookOpen } from 'lucide-react';

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
  const [resourceTypes, setResourceTypes] = useState<string[]>(["all"]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        // Fetch from API
        const response = await fetch('/api/resources');
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        setResources(data);
        
        // Extract unique resource types from the data
        const uniqueTypes = new Set<string>();
        data.forEach((resource: Resource) => {
          if (resource.type) {
            uniqueTypes.add(resource.type.toLowerCase());
          }
        });
        
        // Convert Set to array and add "all" at the beginning
        const types = ["all", ...Array.from(uniqueTypes)];
        setResourceTypes(types);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setResources([]);
        setResourceTypes(["all"]);
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
    const lowerType = type.toLowerCase();
    switch(lowerType) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'slides':
        return <FileText className="h-5 w-5" />;
      case 'worksheet':
        return <FileText className="h-5 w-5" />;
      case 'guide':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Link2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-6 text-white">Resources</h1>
        
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2">
            {resourceTypes.map((type) => (
              <button 
                key={type}
                onClick={() => setActiveTab(type)} 
                className={`px-4 py-2 mr-2 rounded-md capitalize ${
                  activeTab === type ? "bg-primary text-white" : "bg-card text-foreground"
                }`}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
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
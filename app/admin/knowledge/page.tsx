"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Database, CheckCircle, AlertCircle } from "lucide-react"
import AdminAuth from "@/components/AdminAuth"

export default function KnowledgeManagement() {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; details?: any } | null>(null)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const setupVectorDatabase = async () => {
    setIsSettingUp(true)
    setMessage(null)

    try {
      const response = await fetch("/api/setup-vectors", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to setup vector database")
      }

      setMessage({ type: "success", text: "Vector database setup complete!" })
    } catch (error) {
      console.error("Setup error:", error)
      setMessage({ type: "error", text: "Failed to setup vector database" })
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setContent(text)
    }
    reader.readAsText(file)
  }

  const addKnowledge = async () => {
    if (!content.trim()) {
      setMessage({ type: "error", text: "Please enter some content" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/knowledge/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          metadata: {
            source: "manual_upload",
            uploaded_at: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add knowledge")
      }

      const data = await response.json()
      setMessage({
        type: "success",
        text: `Successfully processed ${data.chunks_processed} chunks and stored ${data.chunks_stored} in the knowledge base.`,
        details: data,
      })
      setContent("")
    } catch (error) {
      console.error("Error adding knowledge:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setMessage({ type: "error", text: "Failed to add knowledge to the database", details: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const testTable = async () => {
    try {
      const response = await fetch("/api/knowledge/test")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setTestResult({ success: false, error: errorMessage })
    }
  }

  return (
    <AdminAuth>
      <div className="p-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-8">Knowledge Base Management</h1>

          <Card className="mb-6 bg-[#1a2235] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Setup Knowledge Base Table</CardTitle>
              <CardDescription className="text-gray-400">
                Create the knowledge_base table in your Supabase database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">Manual Setup Required:</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to Table Editor</li>
                    <li>Click "New Table"</li>
                    <li>Name it "knowledge_base"</li>
                    <li>
                      Add these columns:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>id (int8, primary key, auto-increment)</li>
                        <li>content (text)</li>
                        <li>metadata (jsonb, nullable)</li>
                        <li>created_at (timestamptz, default: now())</li>
                      </ul>
                    </li>
                    <li>Click "Save"</li>
                  </ol>
                </div>
                <Button onClick={setupVectorDatabase} disabled={isSettingUp} className="bg-blue-600 hover:bg-blue-700">
                  {isSettingUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Check Table Status
                    </>
                  )}
                </Button>
                <Button onClick={testTable} variant="outline" className="ml-2">
                  Test Table
                </Button>

                {testResult && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a2235] border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Add Knowledge</CardTitle>
              <CardDescription className="text-gray-400">
                Add new information to the AI assistant's knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload a text file or paste content below
                </label>
                <Input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="bg-[#111827] border-gray-600 text-white"
                />
              </div>

              <Textarea
                placeholder="Paste your knowledge content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="bg-[#111827] border-gray-600 text-white placeholder:text-gray-500"
              />

              {message && (
                <Alert
                  className={message.type === "success" ? "bg-green-900 border-green-700" : "bg-red-900 border-red-700"}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription className="text-white">
                    <div>{message.text}</div>
                    {message.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Show details</summary>
                        <pre className="text-xs mt-1 whitespace-pre-wrap">
                          {JSON.stringify(message.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={addKnowledge}
                disabled={isLoading || !content.trim()}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add to Knowledge Base
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-[#1a2235] rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">How it works:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Content is automatically split into manageable chunks</li>
              <li>Each chunk is converted to vector embeddings for semantic search</li>
              <li>When users ask questions, only relevant chunks are retrieved</li>
              <li>This allows unlimited knowledge base growth without token limits</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminAuth>
  )
}

"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, FileText, Users } from "lucide-react"
import AdminAuth from "@/components/AdminAuth"

export default function AdminDashboard() {
  return (
    <AdminAuth>
      <div className="p-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-[#1a2235] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Knowledge Base
                </CardTitle>
                <CardDescription className="text-gray-400">Manage the AI assistant's knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/knowledge">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Manage Knowledge</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2235] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Scholarships
                </CardTitle>
                <CardDescription className="text-gray-400">View and manage scholarship listings</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/scholarships">
                  <Button className="w-full bg-green-600 hover:bg-green-700">View Scholarships</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2235] border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Resources
                </CardTitle>
                <CardDescription className="text-gray-400">Manage student resources and materials</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/resources">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">View Resources</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-[#1a2235] rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">∞</div>
                <div className="text-sm text-gray-400">Knowledge Chunks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">Active</div>
                <div className="text-sm text-gray-400">AI Assistant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">Availability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminAuth>
  )
}

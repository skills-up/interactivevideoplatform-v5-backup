import Link from "next/link"
import { BarChart3, Film, FolderPlus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsSummary } from "@/components/dashboard/analytics-summary"
import { RecentVideos } from "@/components/dashboard/recent-videos"
import { RecentInteractions } from "@/components/dashboard/recent-interactions"
import { RequireAuth } from "@/components/auth/require-auth"
import { Permission } from "@/lib/auth/permissions"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function DashboardPage() {
  return (
    <RequireAuth permission={Permission.CREATE_VIDEO}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 px-4 py-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <DashboardSidebar />
            <main className="flex-1">
              <h1 className="mb-6 text-2xl font-bold">Creator Dashboard</h1>
              <div className="grid gap-6">
                <AnalyticsSummary />
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Create and manage your content</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left" asChild>
                        <Link href="/dashboard/videos/import">
                          <div className="flex w-full items-center gap-2">
                            <Upload className="h-5 w-5" />
                            <span className="font-semibold">Import Video</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Import from YouTube, DailyMotion, etc.</p>
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left" asChild>
                        <Link href="/dashboard/series/create">
                          <div className="flex w-full items-center gap-2">
                            <FolderPlus className="h-5 w-5" />
                            <span className="font-semibold">Create Series</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Organize videos into a series</p>
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left" asChild>
                        <Link href="/dashboard/videos/editor">
                          <div className="flex w-full items-center gap-2">
                            <Film className="h-5 w-5" />
                            <span className="font-semibold">Add Interactions</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Make your videos interactive</p>
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-auto flex-col items-start gap-1 p-4 text-left" asChild>
                        <Link href="/dashboard/analytics">
                          <div className="flex w-full items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            <span className="font-semibold">View Analytics</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Track performance metrics</p>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Your latest content and interactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="videos">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="videos">Recent Videos</TabsTrigger>
                          <TabsTrigger value="interactions">Recent Interactions</TabsTrigger>
                        </TabsList>
                        <TabsContent value="videos" className="mt-4">
                          <RecentVideos />
                        </TabsContent>
                        <TabsContent value="interactions" className="mt-4">
                          <RecentInteractions />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}


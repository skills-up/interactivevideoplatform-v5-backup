"use client"

import type React from "react"

import { RequireAuth } from "@/components/auth/require-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Permission } from "@/lib/auth/permissions"
import { ArrowLeft, Film, Loader2, Youtube } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ImportVideoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [videoSource, setVideoSource] = useState<"youtube" | "dailymotion" | "vimeo" | "other">("youtube")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoData, setVideoData] = useState<{
    title: string
    description: string
    thumbnail: string
    duration: number
  } | null>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value)
    // Reset video data when URL changes
    setVideoData(null)
  }

  const handleFetchMetadata = async () => {
    if (!videoUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a video URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // In a real app, you would call your API to fetch video metadata
    // For demo purposes, we'll simulate an API call with mock data

    setTimeout(() => {
      // Mock data based on video source
      let mockData

      if (videoSource === "youtube") {
        mockData = {
          title: "How to Create Interactive Videos",
          description:
            "In this tutorial, I'll show you how to create engaging interactive videos that will keep your audience engaged and boost learning outcomes.",
          thumbnail: "/placeholder.svg?height=200&width=350",
          duration: 610, // 10:10 in seconds
        }
      } else if (videoSource === "vimeo") {
        mockData = {
          title: "Advanced Video Editing Techniques",
          description: "Learn professional video editing techniques that will take your content to the next level.",
          thumbnail: "/placeholder.svg?height=200&width=350",
          duration: 845, // 14:05 in seconds
        }
      } else {
        mockData = {
          title: "Video Title from " + videoSource.charAt(0).toUpperCase() + videoSource.slice(1),
          description: "Video description will appear here after fetching metadata.",
          thumbnail: "/placeholder.svg?height=200&width=350",
          duration: 300, // 5:00 in seconds
        }
      }

      setVideoData(mockData)
      setIsLoading(false)

      toast({
        title: "Metadata Retrieved",
        description: "Video information has been successfully retrieved",
      })
    }, 1500)
  }

  const handleImport = () => {
    if (!videoData) {
      toast({
        title: "Fetch Metadata First",
        description: "Please fetch video metadata before importing",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    // Simulate import process
    setTimeout(() => {
      setIsImporting(false)

      toast({
        title: "Video Imported",
        description: "Your video has been imported successfully",
      })

      // Redirect to the video editor
      router.push("/dashboard/videos/editor")
    }, 2000)
  }

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <RequireAuth permission={Permission.CREATE_VIDEO}>
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Link
            href="/dashboard/videos"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to videos
          </Link>
        </div>
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold">Import Video</h1>

          <Card>
            <CardHeader>
              <CardTitle>Import from External Source</CardTitle>
              <CardDescription>
                Import a video from YouTube, DailyMotion, Vimeo, or other supported platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Select Video Source</Label>
                <RadioGroup
                  value={videoSource}
                  onValueChange={(value) => setVideoSource(value as any)}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                >
                  <div>
                    <RadioGroupItem value="youtube" id="youtube" className="peer sr-only" />
                    <Label
                      htmlFor="youtube"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Youtube className="mb-3 h-6 w-6 text-red-500" />
                      YouTube
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dailymotion" id="dailymotion" className="peer sr-only" />
                    <Label
                      htmlFor="dailymotion"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Film className="mb-3 h-6 w-6 text-blue-500" />
                      DailyMotion
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="vimeo" id="vimeo" className="peer sr-only" />
                    <Label
                      htmlFor="vimeo"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Film className="mb-3 h-6 w-6 text-teal-500" />
                      Vimeo
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="other" id="other" className="peer sr-only" />
                    <Label
                      htmlFor="other"
                      className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Film className="mb-3 h-6 w-6 text-gray-500" />
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder={`Enter ${videoSource} video URL`}
                    value={videoUrl}
                    onChange={handleUrlChange}
                    disabled={isLoading || isImporting}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleFetchMetadata} disabled={!videoUrl || isLoading || isImporting}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      "Fetch Metadata"
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the full URL of the video you want to import (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
              </p>

              {videoData && (
                <div className="rounded-lg border p-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <img
                          src={videoData.thumbnail || "/placeholder.svg"}
                          alt="Video thumbnail"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Duration:</span> {formatDuration(videoData.duration)}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="video-title">Title</Label>
                        <Input
                          id="video-title"
                          value={videoData.title}
                          onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                          disabled={isImporting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="video-description">Description</Label>
                        <Textarea
                          id="video-description"
                          value={videoData.description}
                          onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                          rows={4}
                          disabled={isImporting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()} disabled={isLoading || isImporting}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!videoData || isLoading || isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import Video"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}


"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Film, Upload, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function CreatePage() {
  const [videoSource, setVideoSource] = useState<"youtube" | "dailymotion" | "vimeo" | "upload">("youtube")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [videoDescription, setVideoDescription] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = () => {
    setIsImporting(true)
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false)
      // In a real app, you would redirect to the editor page after successful import
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold">Create New Video</h1>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Video</TabsTrigger>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
          </TabsList>
          <TabsContent value="import" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Import from External Source</CardTitle>
                <CardDescription>
                  Import a video from YouTube, DailyMotion, Vimeo, or other supported platforms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Select Video Source</Label>
                  <RadioGroup
                    defaultValue="youtube"
                    className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                    onValueChange={(value) => setVideoSource(value as any)}
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
                <div className="space-y-2">
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder={`Enter ${videoSource} video URL`}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full URL of the video you want to import (e.g.,
                    https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-title">Video Title</Label>
                  <Input
                    id="video-title"
                    placeholder="Enter video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll try to import this automatically from the source, but you can customize it
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-description">Video Description</Label>
                  <Textarea
                    id="video-description"
                    placeholder="Enter video description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll try to import this automatically from the source, but you can customize it
                  </p>
                </div>
                <Button onClick={handleImport} disabled={!videoUrl || isImporting} className="w-full">
                  {isImporting ? "Importing..." : "Import Video"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Video File</CardTitle>
                <CardDescription>Upload a video file from your computer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-input p-12">
                  <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">Drag and drop your video file</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Or click to browse files</p>
                  <Button variant="outline">Select File</Button>
                  <p className="mt-4 text-xs text-muted-foreground">Supported formats: MP4, MOV, AVI, WebM (max 2GB)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-title">Video Title</Label>
                  <Input id="upload-title" placeholder="Enter video title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-description">Video Description</Label>
                  <Textarea id="upload-description" placeholder="Enter video description" rows={4} />
                </div>
                <Button className="w-full">Upload Video</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


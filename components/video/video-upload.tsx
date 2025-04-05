"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, Link, Video } from "lucide-react"
import { createVideo, type VideoCreateInput } from "@/lib/api"
import { useRouter } from "next/navigation"

interface VideoUploadProps {
  onSuccess?: (videoId: string) => void
}

export function VideoUpload({ onSuccess }: VideoUploadProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url")
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [videoDescription, setVideoDescription] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Detect video source type from URL
  const detectSourceType = (url: string): "youtube" | "vimeo" | "dailymotion" | "local" => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube"
    } else if (url.includes("vimeo.com")) {
      return "vimeo"
    } else if (url.includes("dailymotion.com")) {
      return "dailymotion"
    } else {
      return "local"
    }
  }

  // Extract video ID from URL
  const extractVideoId = (url: string, sourceType: "youtube" | "vimeo" | "dailymotion" | "local"): string => {
    switch (sourceType) {
      case "youtube":
        if (url.includes("youtube.com/watch?v=")) {
          return new URL(url).searchParams.get("v") || ""
        } else if (url.includes("youtu.be/")) {
          return url.split("youtu.be/")[1].split("?")[0]
        }
        return ""
      case "vimeo":
        if (url.includes("vimeo.com/")) {
          return url.split("vimeo.com/")[1].split("?")[0]
        }
        return ""
      case "dailymotion":
        if (url.includes("dailymotion.com/video/")) {
          return url.split("dailymotion.com/video/")[1].split("?")[0]
        }
        return ""
      default:
        return url
    }
  }

  // Convert to embed URL
  const getEmbedUrl = (url: string, sourceType: "youtube" | "vimeo" | "dailymotion" | "local"): string => {
    const videoId = extractVideoId(url, sourceType)

    switch (sourceType) {
      case "youtube":
        return `https://www.youtube.com/embed/${videoId}`
      case "vimeo":
        return `https://player.vimeo.com/video/${videoId}`
      case "dailymotion":
        return `https://www.dailymotion.com/embed/video/${videoId}`
      default:
        return url
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive",
        })
        return
      }

      setUploadedFile(file)

      // Auto-fill title from filename
      if (!videoTitle) {
        const fileName = file.name.split(".").slice(0, -1).join(".")
        setVideoTitle(fileName)
      }
    }
  }

  // Handle URL video creation
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoUrl) {
      toast({
        title: "URL required",
        description: "Please enter a video URL",
        variant: "destructive",
      })
      return
    }

    if (!videoTitle) {
      toast({
        title: "Title required",
        description: "Please enter a title for your video",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const sourceType = detectSourceType(videoUrl)
      const embedUrl = getEmbedUrl(videoUrl, sourceType)

      const videoData: VideoCreateInput = {
        title: videoTitle,
        description: videoDescription,
        sourceUrl: embedUrl,
        sourceType,
        isPublic: false,
      }

      const result = await createVideo(videoData)

      toast({
        title: "Video added successfully",
        description: "Your video has been added to your library",
      })

      if (onSuccess) {
        onSuccess(result.id)
      } else {
        router.push(`/dashboard/videos/editor/${result.id}`)
      }
    } catch (error) {
      console.error("Error creating video:", error)
      toast({
        title: "Failed to add video",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadedFile) {
      toast({
        title: "File required",
        description: "Please select a video file to upload",
        variant: "destructive",
      })
      return
    }

    if (!videoTitle) {
      toast({
        title: "Title required",
        description: "Please enter a title for your video",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a FormData object to upload the file
      const formData = new FormData()
      formData.append("file", uploadedFile)

      // Upload the file to your storage service
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload video file")
      }

      const { url } = await uploadResponse.json()

      // Create the video entry
      const videoData: VideoCreateInput = {
        title: videoTitle,
        description: videoDescription,
        sourceUrl: url,
        sourceType: "local",
        isPublic: false,
      }

      const result = await createVideo(videoData)

      toast({
        title: "Video uploaded successfully",
        description: "Your video has been added to your library",
      })

      if (onSuccess) {
        onSuccess(result.id)
      } else {
        router.push(`/dashboard/videos/editor/${result.id}`)
      }
    } catch (error) {
      console.error("Error uploading video:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add a New Video</CardTitle>
        <CardDescription>Upload a video file or add a video from YouTube, Vimeo, or Dailymotion</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "url" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">External URL</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="video-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Link className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, and Dailymotion URLs</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-title">Title</Label>
                <Input
                  id="video-title"
                  placeholder="Enter video title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-description">Description</Label>
                <Input
                  id="video-description"
                  placeholder="Enter video description (optional)"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </form>
          </TabsContent>

          <TabsContent value="upload">
            <form onSubmit={handleFileUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="video-file">Video File</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    id="video-file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                    disabled={isLoading}
                  />
                  {!uploadedFile ? (
                    <div className="text-center">
                      <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Select Video File
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">MP4, WebM, or OGG. Maximum file size: 500MB</p>
                    </div>
                  ) : (
                    <div className="text-center w-full">
                      <Video className="mx-auto h-8 w-8 text-primary" />
                      <p className="mt-2 font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      {uploadProgress > 0 && (
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setUploadedFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                        disabled={isLoading}
                      >
                        Change File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-title">Title</Label>
                <Input
                  id="upload-title"
                  placeholder="Enter video title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-description">Description</Label>
                <Input
                  id="upload-description"
                  placeholder="Enter video description (optional)"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" onClick={activeTab === "url" ? handleUrlSubmit : handleFileUpload} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {activeTab === "url" ? "Add Video" : "Upload Video"}
        </Button>
      </CardFooter>
    </Card>
  )
}


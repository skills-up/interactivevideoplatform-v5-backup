"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Upload, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RequireAuth } from "@/components/auth/require-auth"
import { Permission } from "@/lib/auth/permissions"

export default function CreateVideoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    visibility: "public",
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Create a preview URL for the video
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)

      // Auto-fill title from filename if empty
      if (!formData.title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "") // Remove extension
        setFormData((prev) => ({ ...prev, title: fileName }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // In a real app, you would upload the file to your server or a storage service
    // and then create a video record in your database

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Video Uploaded",
        description: "Your video has been uploaded successfully",
      })

      // Redirect to the video editor
      router.push("/dashboard/videos/editor")
    }, 2000)
  }

  return (
    <RequireAuth permission={Permission.CREATE_VIDEO}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
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
            <h1 className="mb-6 text-2xl font-bold">Create New Video</h1>

            <Card>
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
                <CardDescription>Upload a video file from your computer</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="file">Video File</Label>
                    {!file ? (
                      <div
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-input p-12 cursor-pointer"
                        onClick={() => document.getElementById("file")?.click()}
                      >
                        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium">Drag and drop your video file</h3>
                        <p className="mb-4 text-sm text-muted-foreground">Or click to browse files</p>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            document.getElementById("file")?.click()
                          }}
                        >
                          Select File
                        </Button>
                        <p className="mt-4 text-xs text-muted-foreground">
                          Supported formats: MP4, MOV, AVI, WebM (max 2GB)
                        </p>
                        <Input
                          id="file"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="aspect-video overflow-hidden rounded-lg bg-black">
                          {previewUrl && <video src={previewUrl} controls className="h-full w-full" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => {
                              setFile(null)
                              setPreviewUrl(null)
                            }}
                            disabled={isUploading}
                          >
                            Change File
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter video title"
                      required
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter video description"
                      rows={4}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="Enter tags separated by commas"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground">Tags help viewers find your video</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <select
                      id="visibility"
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      disabled={isUploading}
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Control who can see your video</p>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isUploading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading || !file}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Video className="mr-2 h-4 w-4" />
                          Upload Video
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}


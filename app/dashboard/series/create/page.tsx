"use client"

import type React from "react"

import { RequireAuth } from "@/components/auth/require-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Permission } from "@/lib/auth/permissions"
import { ArrowLeft, Film, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function CreateSeriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "9.99",
  })
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      const previewUrl = URL.createObjectURL(file)
      setThumbnailPreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!thumbnail) {
      toast({
        title: "Thumbnail Required",
        description: "Please upload a thumbnail image for your series",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // In a real app, you would upload the thumbnail and create the series in your database

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Series Created",
        description: "Your series has been created successfully",
      })

      // Redirect to series management page
      router.push("/dashboard/series")
    }, 1500)
  }

  return (
    <RequireAuth permission={Permission.CREATE_SERIES}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container px-4 py-6">
          <div className="mb-6">
            <Link
              href="/dashboard/series"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to series
            </Link>
          </div>
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-2xl font-bold">Create New Series</h1>

            <Card>
              <CardHeader>
                <CardTitle>Series Details</CardTitle>
                <CardDescription>Create a new series to organize your videos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Series Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter series title"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter series description"
                      rows={4}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly Subscription Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0.99"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="9.99"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">Set the monthly subscription price for this series</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Series Thumbnail</Label>
                    {!thumbnailPreview ? (
                      <div
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-input p-12 cursor-pointer"
                        onClick={() => document.getElementById("thumbnail")?.click()}
                      >
                        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium">Upload thumbnail image</h3>
                        <p className="mb-4 text-sm text-muted-foreground">Recommended size: 1280x720 pixels</p>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            document.getElementById("thumbnail")?.click()
                          }}
                        >
                          Select Image
                        </Button>
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <img
                            src={thumbnailPreview || "/placeholder.svg"}
                            alt="Thumbnail preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setThumbnail(null)
                            setThumbnailPreview(null)
                          }}
                          disabled={isSubmitting}
                        >
                          Change Thumbnail
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Film className="mr-2 h-4 w-4" />
                          Create Series
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


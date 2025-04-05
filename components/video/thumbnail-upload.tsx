"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

interface ThumbnailUploadProps {
  initialImage?: string
  onUpload?: (imageUrl: string) => void
  onRemove?: () => void
  disabled?: boolean
}

export function ThumbnailUpload({ initialImage, onUpload, onRemove, disabled = false }: ThumbnailUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [image, setImage] = useState<string | null>(initialImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const processFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // In a real app, you would upload the file to your server or a storage service
    // For demo purposes, we'll use a FileReader to get a data URL
    const reader = new FileReader()
    reader.onload = () => {
      const imageUrl = reader.result as string
      setImage(imageUrl)
      if (onUpload) {
        onUpload(imageUrl)
      }
      setIsUploading(false)

      toast({
        title: "Thumbnail Uploaded",
        description: "Your thumbnail has been uploaded successfully",
      })
    }
    reader.onerror = () => {
      setIsUploading(false)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onRemove) {
      onRemove()
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add("border-primary")
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove("border-primary")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove("border-primary")
    }

    if (disabled || isUploading) return

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }

  return (
    <div>
      {!image ? (
        <div
          ref={dropAreaRef}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-12 transition-colors hover:bg-muted/50"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={disabled || isUploading ? undefined : handleButtonClick}
          style={{ cursor: disabled || isUploading ? "default" : "pointer" }}
        >
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">Upload thumbnail image</h3>
          <p className="mb-4 text-sm text-muted-foreground">Recommended size: 1280x720 pixels</p>
          <Button
            variant="outline"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleButtonClick()
            }}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Select Image"
            )}
          </Button>
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-lg">
            <img src={image || "/placeholder.svg"} alt="Thumbnail preview" className="h-full w-full object-cover" />
          </div>
          <Button variant="outline" size="sm" type="button" onClick={handleRemove} disabled={disabled || isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}


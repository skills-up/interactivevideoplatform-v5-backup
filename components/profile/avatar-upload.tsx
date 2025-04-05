"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { useRef, useState } from "react"

interface AvatarUploadProps {
  initialImage?: string
  name?: string
  onUpload?: (imageUrl: string) => void
}

export function AvatarUpload({ initialImage, name, onUpload }: AvatarUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [image, setImage] = useState<string | null>(initialImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
        title: "Avatar Updated",
        description: "Your profile image has been updated successfully",
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

  // Generate initials from name
  const getInitials = () => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={image || ""} alt={name || "User"} />
        <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button variant="outline" size="sm" onClick={handleButtonClick} disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Change Avatar
          </>
        )}
      </Button>
    </div>
  )
}


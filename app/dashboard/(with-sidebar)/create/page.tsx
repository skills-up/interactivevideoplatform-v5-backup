"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { VideoUpload } from "@/components/video/video-upload"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const router = useRouter()

  const handleUploadSuccess = (videoId: string) => {
    router.push(`/dashboard/videos/editor/${videoId}`)
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
          <VideoUpload onSuccess={handleUploadSuccess} />
      </div>
    </div>
  )
}


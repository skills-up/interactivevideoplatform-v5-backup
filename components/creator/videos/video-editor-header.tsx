"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ImportExportDialog } from "./import-export-dialog"
import { Settings, ArrowLeft } from "lucide-react"
import { ShareVideoDialog } from "./share-video-dialog"

interface VideoEditorHeaderProps {
  videoId: string
  videoTitle: string
  onRefresh?: () => void
}

export function VideoEditorHeader({ videoId, videoTitle, onRefresh }: VideoEditorHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/creator/videos">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{videoTitle}</h1>
        </div>
        <p className="text-muted-foreground mt-1">Add and edit interactive elements for your video</p>
      </div>

      <div className="flex space-x-2">
        <ImportExportDialog videoId={videoId} onSuccess={onRefresh} />

        <ShareVideoDialog videoId={videoId} />

        <Button variant="outline" asChild>
          <Link href={`/creator/videos/${videoId}/settings`}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  )
}


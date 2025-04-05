"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { ShareSettings } from "@/types/sharing"
import type { InteractiveElement } from "@/types/video"
import { VideoEmbed } from "./video-embed"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share, ExternalLink } from "lucide-react"

interface VideoShareProps {
  video: {
    id: string
    title: string
    description: string
    videoUrl: string
    thumbnailUrl: string
    duration: number
    interactiveElements: InteractiveElement[]
  }
  creator?: {
    id: string
    name: string
    image: string
  }
  settings: ShareSettings
  accessKey: string
}

export function VideoShare({ video, creator, settings, accessKey }: VideoShareProps) {
  const [showShareOptions, setShowShareOptions] = useState(false)

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `${process.env.NEXT_PUBLIC_API_URL}/share/${accessKey}`

  const embedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/embed/${accessKey}`
      : `${process.env.NEXT_PUBLIC_API_URL}/embed/${accessKey}`

  const iframeCode = `<iframe 
  width="${settings.embedWidth}" 
  height="${settings.embedHeight}" 
  src="${embedUrl}" 
  frameborder="0" 
  allowfullscreen
  ${settings.autoplay ? 'allow="autoplay"' : ""}
></iframe>`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        setShowShareOptions(true)
      }
    } else {
      setShowShareOptions(true)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="aspect-video overflow-hidden rounded-lg shadow-lg mb-6">
        <VideoEmbed video={video} settings={settings} accessKey={accessKey} />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
        <p className="text-muted-foreground">{video.description}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        {creator && (
          <div className="flex items-center space-x-3">
            {creator.image && (
              <Image
                src={creator.image || "/placeholder.svg"}
                alt={creator.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{creator.name}</p>
              <p className="text-sm text-muted-foreground">Creator</p>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={handleShare} variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>

          {settings.allowEmbedding && (
            <Button asChild variant="outline">
              <Link href={embedUrl} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Embed
              </Link>
            </Button>
          )}
        </div>
      </div>

      {showShareOptions && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Share this video</h3>
            <div className="flex flex-col space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Share link</p>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={() => copyToClipboard(shareUrl)} className="rounded-l-none">
                    Copy
                  </Button>
                </div>
              </div>

              {settings.allowEmbedding && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Embed code</p>
                  <div className="flex">
                    <textarea
                      value={iframeCode}
                      readOnly
                      rows={3}
                      className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button onClick={() => copyToClipboard(iframeCode)} className="rounded-l-none h-auto">
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


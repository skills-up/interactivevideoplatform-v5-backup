"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Facebook, Twitter, Linkedin, Mail, Link2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareVideoDialogProps {
  videoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareVideoDialog({ videoId, open, onOpenChange }: ShareVideoDialogProps) {
  const { toast } = useToast()
  const [embedSize, setEmbedSize] = useState<"small" | "medium" | "large">("medium")

  const videoUrl = typeof window !== "undefined" ? `${window.location.origin}/videos/${videoId}` : `/videos/${videoId}`

  const embedUrl = typeof window !== "undefined" ? `${window.location.origin}/embed/${videoId}` : `/embed/${videoId}`

  const embedSizes = {
    small: { width: 400, height: 225 },
    medium: { width: 640, height: 360 },
    large: { width: 854, height: 480 },
  }

  const embedCode = `<iframe 
  width="${embedSizes[embedSize].width}" 
  height="${embedSizes[embedSize].height}" 
  src="${embedUrl}" 
  title="Interactive Video Player" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(videoUrl)
    toast({
      title: "Link copied",
      description: "Video link copied to clipboard",
    })
  }

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    toast({
      title: "Embed code copied",
      description: "Embed code copied to clipboard",
    })
  }

  const handleShareSocial = (platform: string) => {
    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`
        break
      case "email":
        shareUrl = `mailto:?subject=Check out this interactive video&body=${encodeURIComponent(videoUrl)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
          <DialogDescription>Share this video with your friends or embed it on your website</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={videoUrl} readOnly className="flex-1" />
              <Button size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => handleShareSocial("facebook")}>
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Share on Facebook</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShareSocial("twitter")}>
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Share on Twitter</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShareSocial("linkedin")}>
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">Share on LinkedIn</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleShareSocial("email")}>
                <Mail className="h-5 w-5" />
                <span className="sr-only">Share via Email</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Size</span>
                <div className="flex space-x-1">
                  <Button
                    variant={embedSize === "small" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmbedSize("small")}
                  >
                    Small
                  </Button>
                  <Button
                    variant={embedSize === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmbedSize("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={embedSize === "large" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEmbedSize("large")}
                  >
                    Large
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Input value={embedCode} readOnly className="flex-1 font-mono text-xs" />
                <Button size="sm" onClick={handleCopyEmbed}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border p-2 flex items-center justify-center">
                <div
                  style={{
                    width: `${embedSizes[embedSize].width / 4}px`,
                    height: `${embedSizes[embedSize].height / 4}px`,
                  }}
                  className="bg-muted flex items-center justify-center"
                >
                  <Link2 className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


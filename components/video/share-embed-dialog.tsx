"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Facebook, Link, Share2, Twitter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShareEmbedDialogProps {
  videoId: string
  videoTitle: string
}

export function ShareEmbedDialog({ videoId, videoTitle }: ShareEmbedDialogProps) {
  const { toast } = useToast()
  const [embedWidth, setEmbedWidth] = useState(640)
  const [embedHeight, setEmbedHeight] = useState(360)
  const [autoplay, setAutoplay] = useState(false)
  const [responsive, setResponsive] = useState(true)
  const [startTime, setStartTime] = useState(0)
  const [shareUrl, setShareUrl] = useState(`${window.location.origin}/watch/${videoId}`)
  const [embedTheme, setEmbedTheme] = useState("light")

  // Generate embed code based on current settings
  const generateEmbedCode = () => {
    const baseUrl = `${window.location.origin}/embed/${videoId}`
    const params = new URLSearchParams()

    if (autoplay) params.append("autoplay", "1")
    if (startTime > 0) params.append("start", startTime.toString())
    if (embedTheme !== "light") params.append("theme", embedTheme)

    const url = `${baseUrl}${params.toString() ? `?${params.toString()}` : ""}`

    return responsive
      ? `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">
  <iframe 
    src="${url}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
    title="${videoTitle}">
  </iframe>
</div>`
      : `<iframe 
  width="${embedWidth}" 
  height="${embedHeight}" 
  src="${url}" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen
  title="${videoTitle}">
</iframe>`
  }

  // Generate share URL with optional timestamp
  const generateShareUrl = () => {
    const baseUrl = shareUrl.split("?")[0]
    const params = new URLSearchParams()

    if (startTime > 0) params.append("t", startTime.toString())

    return `${baseUrl}${params.toString() ? `?${params.toString()}` : ""}`
  }

  // Copy text to clipboard
  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: successMessage,
        })
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        toast({
          title: "Copy failed",
          description: "Please try again or copy manually",
          variant: "destructive",
        })
      })
  }

  // Share to social media
  const shareToSocial = (platform: "twitter" | "facebook") => {
    const url = encodeURIComponent(generateShareUrl())
    const text = encodeURIComponent(`Check out this interactive video: ${videoTitle}`)

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share & Embed</DialogTitle>
          <DialogDescription>Share this interactive video with others or embed it on your website.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="share" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Share URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="share-url"
                  value={generateShareUrl()}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(generateShareUrl(), "Link copied to clipboard")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time">Start at specific time</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="start-time"
                  value={[startTime]}
                  max={3600}
                  step={1}
                  onValueChange={(value) => setStartTime(value[0])}
                  className="flex-1"
                />
                <span className="w-16 text-center">
                  {Math.floor(startTime / 60)}:{(startTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Share on social media</Label>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => shareToSocial("twitter")}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => shareToSocial("facebook")}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(generateShareUrl(), "Link copied to clipboard")}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="responsive">Responsive Embed</Label>
                <Switch id="responsive" checked={responsive} onCheckedChange={setResponsive} />
              </div>
              <p className="text-sm text-muted-foreground">
                Responsive embeds automatically adjust to fit the container width.
              </p>
            </div>

            {!responsive && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="embed-width">Width (px)</Label>
                  <Input
                    id="embed-width"
                    type="number"
                    min="320"
                    max="1920"
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(Number.parseInt(e.target.value) || 640)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embed-height">Height (px)</Label>
                  <Input
                    id="embed-height"
                    type="number"
                    min="180"
                    max="1080"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(Number.parseInt(e.target.value) || 360)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="embed-theme">Player Theme</Label>
              <Select value={embedTheme} onValueChange={setEmbedTheme}>
                <SelectTrigger id="embed-theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay">Autoplay</Label>
                <Switch id="autoplay" checked={autoplay} onCheckedChange={setAutoplay} />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Autoplay may be blocked by some browsers unless the video is muted.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed Code</Label>
              <Textarea
                id="embed-code"
                value={generateEmbedCode()}
                readOnly
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={() => copyToClipboard(generateEmbedCode(), "Embed code copied to clipboard")}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Embed Code
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Share2, Bookmark, Flag, MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShareVideoDialog } from "./share-video-dialog"
import { useToast } from "@/hooks/use-toast"

interface VideoActionsProps {
  videoId: string
  likes: number
  views: number
  isOwner?: boolean
}

export function VideoActions({ videoId, likes, views, isOwner }: VideoActionsProps) {
  const { toast } = useToast()
  const [likeCount, setLikeCount] = useState(likes)
  const [hasLiked, setHasLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleLike = async () => {
    if (hasLiked) {
      setLikeCount((prev) => prev - 1)
      setHasLiked(false)

      // Call API to unlike
      try {
        await fetch(`/api/videos/${videoId}/like`, {
          method: "DELETE",
        })
      } catch (error) {
        // Revert on error
        setLikeCount((prev) => prev + 1)
        setHasLiked(true)
        toast({
          title: "Error",
          description: "Failed to unlike the video. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      setLikeCount((prev) => prev + 1)
      setHasLiked(true)

      // Call API to like
      try {
        await fetch(`/api/videos/${videoId}/like`, {
          method: "POST",
        })
      } catch (error) {
        // Revert on error
        setLikeCount((prev) => prev - 1)
        setHasLiked(false)
        toast({
          title: "Error",
          description: "Failed to like the video. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleBookmark = async () => {
    setIsBookmarked((prev) => !prev)

    try {
      if (isBookmarked) {
        await fetch(`/api/videos/${videoId}/bookmark`, {
          method: "DELETE",
        })
        toast({
          title: "Removed from bookmarks",
          description: "Video has been removed from your bookmarks",
        })
      } else {
        await fetch(`/api/videos/${videoId}/bookmark`, {
          method: "POST",
        })
        toast({
          title: "Added to bookmarks",
          description: "Video has been added to your bookmarks",
        })
      }
    } catch (error) {
      setIsBookmarked((prev) => !prev)
      toast({
        title: "Error",
        description: "Failed to update bookmark status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for your feedback. We'll review this video.",
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{views.toLocaleString()} views</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={hasLiked ? "default" : "outline"} size="sm" className="gap-1.5" onClick={handleLike}>
          <ThumbsUp className="h-4 w-4" />
          <span>{likeCount.toLocaleString()}</span>
        </Button>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowShareDialog(true)}>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>

        <Button variant={isBookmarked ? "default" : "outline"} size="sm" className="gap-1.5" onClick={handleBookmark}>
          <Bookmark className="h-4 w-4" />
          <span>{isBookmarked ? "Saved" : "Save"}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReport}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ShareVideoDialog videoId={videoId} open={showShareDialog} onOpenChange={setShowShareDialog} />
    </div>
  )
}


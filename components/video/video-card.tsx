import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Eye, ThumbsUp, Clock } from "lucide-react"

interface VideoCardProps {
  video: {
    id: string
    title: string
    thumbnailUrl?: string
    duration?: number
    views?: number
    likes?: number
    createdAt: Date
    creator?: {
      id: string
      name: string
    }
  }
  showCreator?: boolean
}

export function VideoCard({ video, showCreator = true }: VideoCardProps) {
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <Link href={`/videos/${video.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnailUrl || `/placeholder.svg?height=200&width=350`}
            alt={video.title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2">{video.title}</h3>
          {showCreator && video.creator && <p className="text-sm text-muted-foreground mt-1">{video.creator.name}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {video.views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.views.toLocaleString()}
              </span>
            )}
            {video.likes !== undefined && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {video.likes.toLocaleString()}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}


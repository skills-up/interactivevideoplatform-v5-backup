import Link from "next/link"
import { Clock, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

interface VideoCardProps {
  title: string
  creator: string
  thumbnail: string
  views: number
  date: string
  href: string
  interactive?: boolean
  className?: string
}

export function VideoCard({
  title,
  creator,
  thumbnail,
  views,
  date,
  href,
  interactive = false,
  className,
}: VideoCardProps) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <img
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
          <Clock className="h-3 w-3" />
          <span>10:24</span>
        </div>
        {interactive && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-primary/90 px-1.5 py-0.5 text-xs text-primary-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Interactive</span>
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="line-clamp-2 font-medium group-hover:text-primary">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{creator}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <span>{formatViews(views)} views</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  )
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  } else {
    return views.toString()
  }
}


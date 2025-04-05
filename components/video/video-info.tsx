import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface VideoInfoProps {
  title: string
  description?: string
  creator: {
    id: string
    name: string
    image?: string
  }
  createdAt: Date
  tags?: string[]
  category?: string
}

export function VideoInfo({ title, description, creator, createdAt, tags, category }: VideoInfoProps) {
  const initials = creator.name
    ? creator.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U"

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={creator.image || ""} alt={creator.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div>
            <Link href={`/creators/${creator.id}`} className="font-medium hover:underline">
              {creator.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <Button variant="secondary">Subscribe</Button>
      </div>

      {description && (
        <div className="rounded-lg bg-muted p-4">
          <p className="whitespace-pre-line text-sm">{description}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {category && (
          <Link href={`/videos?category=${category}`}>
            <Badge variant="secondary" className="capitalize">
              {category}
            </Badge>
          </Link>
        )}

        {tags?.map((tag) => (
          <Link key={tag} href={`/videos/search?q=${tag}`}>
            <Badge variant="outline">#{tag}</Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}


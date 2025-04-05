"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string
    image?: string
  }
}

interface CommentSectionProps {
  videoId: string
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading comments
  useState(() => {
    setTimeout(() => {
      setComments([
        {
          id: "1",
          content: "Great video! I learned a lot from the interactive elements.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          user: {
            id: "user1",
            name: "Jane Smith",
            image: "",
          },
        },
        {
          id: "2",
          content: "The quiz at 2:30 was challenging but helpful. Could you make more videos like this?",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          user: {
            id: "user2",
            name: "John Doe",
            image: "",
          },
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSubmitComment = async () => {
    if (!comment.trim() || !session?.user) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        content: comment,
        createdAt: new Date(),
        user: {
          id: session.user.id,
          name: session.user.name || "Anonymous",
          image: session.user.image || "",
        },
      }

      setComments([newComment, ...comments])
      setComment("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Comments</h2>

      {session?.user ? (
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>
              {session.user.name
                ? session.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={!comment.trim() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4 text-center">
          <p className="text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to comment on this video
          </p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
                <AvatarFallback>
                  {comment.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/creators/${comment.user.id}`} className="font-medium hover:underline">
                    {comment.user.name}
                  </Link>
                </div>
                <p className="text-sm">{comment.content}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  )
}


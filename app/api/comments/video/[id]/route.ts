import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import Comment from "@/lib/db/models/comment"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      video: params.id,
      parent: { $exists: false },
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get replies for these comments
    const commentIds = comments.map((comment) => comment._id)
    const replies = await Comment.find({
      parent: { $in: commentIds },
    })
      .populate("user", "name avatar")
      .sort({ createdAt: 1 })

    // Group replies by parent comment
    const repliesByParent = replies.reduce(
      (acc, reply) => {
        const parentId = reply.parent?.toString()
        if (!acc[parentId]) {
          acc[parentId] = []
        }
        acc[parentId].push(reply)
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Add replies to their parent comments
    const commentsWithReplies = comments.map((comment) => {
      const commentObj = comment.toObject()
      commentObj.replies = repliesByParent[comment._id.toString()] || []
      return commentObj
    })

    const total = await Comment.countDocuments({
      video: params.id,
      parent: { $exists: false },
    })

    return NextResponse.json({
      comments: commentsWithReplies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}


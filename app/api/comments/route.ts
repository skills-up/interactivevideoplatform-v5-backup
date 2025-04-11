import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Comment from "@/models/Comment"
import Video from "@/models/Video"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    await dbConnect()

    const comments = await Comment.find({
      video: videoId,
      parent: { $exists: false }, // Only get top-level comments
    })
      .sort({ createdAt: -1 })
      .populate("user", "name image")
      .lean()

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parent: comment._id })
          .sort({ createdAt: 1 })
          .populate("user", "name image")
          .lean()

        return { ...comment, replies }
      }),
    )

    return NextResponse.json(commentsWithReplies)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.content || !data.video) {
      return NextResponse.json({ error: "Content and video ID are required" }, { status: 400 })
    }

    await dbConnect()

    // Verify video exists
    const video = await Video.findById(data.video)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Create comment
    const comment = await Comment.create({
      ...data,
      user: session.user.id,
    })

    // Populate user data
    const populatedComment = await Comment.findById(comment._id).populate("user", "name image").lean()

    return NextResponse.json(populatedComment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}


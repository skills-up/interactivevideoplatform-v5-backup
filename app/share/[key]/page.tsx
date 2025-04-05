import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { VideoShare } from "@/components/video/video-share"
import dbConnect from "@/lib/dbConnect"
import ShareLink from "@/models/ShareLink"
import Video from "@/models/Video"
import User from "@/models/User"

interface SharePageProps {
  params: Promise<{
    key: string
  }>
}

export async function generateMetadata(props: SharePageProps): Promise<Metadata> {
  const params = await props.params;
  try {
    await dbConnect()

    const shareLink = await ShareLink.findOne({
      accessKey: params.key,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    })

    if (!shareLink) {
      return {
        title: "Video Not Found",
        description: "The requested video could not be found or the link has expired.",
      }
    }

    const video = await Video.findById(shareLink.videoId)

    if (!video) {
      return {
        title: "Video Not Found",
        description: "The requested video could not be found.",
      }
    }

    return {
      title: `${video.title} | Interactive Video Platform`,
      description: video.description || "Watch this interactive video",
      openGraph: {
        title: video.title,
        description: video.description || "Watch this interactive video",
        images: [{ url: video.thumbnailUrl }],
      },
    }
  } catch (error) {
    return {
      title: "Interactive Video",
      description: "Watch this interactive video",
    }
  }
}

export default async function SharePage(props: SharePageProps) {
  const params = await props.params;
  try {
    await dbConnect()

    const shareLink = await ShareLink.findOne({
      accessKey: params.key,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    })

    if (!shareLink) {
      notFound()
    }

    // Increment view count
    shareLink.views += 1
    await shareLink.save()

    // Get video details
    const video = await Video.findById(shareLink.videoId)
    if (!video) {
      notFound()
    }

    // Get creator details
    const creator = await User.findOne({ id: video.userId })

    // Filter interactive elements if needed
    const interactiveElements = shareLink.settings.showInteractions ? video.interactiveElements || [] : []

    return (
      <div className="container mx-auto py-8 px-4">
        <VideoShare
          video={{
            id: video._id.toString(),
            title: video.title,
            description: video.description || "",
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            interactiveElements,
          }}
          creator={
            creator
              ? {
                  id: creator.id,
                  name: creator.name,
                  image: creator.image,
                }
              : undefined
          }
          settings={shareLink.settings}
          accessKey={params.key}
        />
      </div>
    )
  } catch (error) {
    console.error("Error loading share page:", error)
    notFound()
  }
}


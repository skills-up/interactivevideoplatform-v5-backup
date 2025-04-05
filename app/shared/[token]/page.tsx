import type { Metadata } from "next"
import dbConnect from "@/lib/dbConnect"
import ShareLink from "@/models/ShareLink"
import Video from "@/models/Video"
import { SharedVideoClientPage } from "./SharedVideoClientPage"

interface SharedVideoPageProps {
  params: {
    token: string
  }
  searchParams: {
    password?: string
  }
}

export async function generateMetadata({ params }: SharedVideoPageProps): Promise<Metadata> {
  await dbConnect()

  try {
    const shareLink = await ShareLink.findOne({ token: params.token })
    if (!shareLink) {
      return {
        title: "Video Not Found",
      }
    }

    const video = await Video.findById(shareLink.videoId)
    if (!video) {
      return {
        title: "Video Not Found",
      }
    }

    return {
      title: `${video.title} - Shared Video`,
      description: video.description || "Shared interactive video",
      openGraph: {
        title: video.title,
        description: video.description || "Shared interactive video",
        type: "video",
        images: [
          {
            url: video.thumbnailUrl || "/images/default-thumbnail.jpg",
            width: 1200,
            height: 630,
            alt: video.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: video.title,
        description: video.description || "Shared interactive video",
        images: [video.thumbnailUrl || "/images/default-thumbnail.jpg"],
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Shared Video",
    }
  }
}

export default async function SharedVideoPage({ params, searchParams }: SharedVideoPageProps) {
  return <SharedVideoClientPage params={params} searchParams={searchParams} />
}


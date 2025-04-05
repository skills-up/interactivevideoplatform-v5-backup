import type { Metadata } from "next"
import dbConnect from "@/lib/dbConnect"
import ShareLink from "@/models/ShareLink"
import Video from "@/models/Video"
import { SharedVideoClientPage } from "./SharedVideoClientPage"

interface SharedVideoPageProps {
  params: Promise<{
    token: string
  }>
  searchParams: Promise<{
    password?: string
  }>
}

export async function generateMetadata(props: SharedVideoPageProps): Promise<Metadata> {
  const params = await props.params;
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

export default async function SharedVideoPage(props: SharedVideoPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return <SharedVideoClientPage params={params} searchParams={searchParams} />
}


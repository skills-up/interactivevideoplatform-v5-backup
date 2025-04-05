import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getVideoById, incrementVideoViews } from "@/lib/videos"
import { VideoPlayer } from "@/components/video/video-player"
import { VideoActions } from "@/components/video/video-actions"
import { VideoInfo } from "@/components/video/video-info"
import { RelatedVideos } from "@/components/video/related-videos"
import { CommentSection } from "@/components/video/comment-section"

interface VideoPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: VideoPageProps): Promise<Metadata> {
  const params = await props.params;
  const video = await getVideoById(params.id)

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
      type: "video",
      videos: [
        {
          url: video.url,
          type: "video/mp4",
          width: 1280,
          height: 720,
        },
      ],
    },
  }
}

export default async function VideoPage(props: VideoPageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  const video = await getVideoById(params.id)

  if (!video) {
    notFound()
  }

  // Increment view count
  await incrementVideoViews(params.id)

  // Check if user is the owner of the video
  const isOwner = session?.user?.id === video.creator.id

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer
            videoId={video.id}
            sourceUrl={video.url}
            sourceType={video.type || "video/mp4"}
            title={video.title}
            isOwner={isOwner}
            showInteractions={true}
            interactiveElements={video.interactions || []}
          />

          <VideoActions videoId={video.id} likes={video.likes} views={video.views} isOwner={isOwner} />

          <VideoInfo
            title={video.title}
            description={video.description}
            creator={video.creator}
            createdAt={video.createdAt}
            tags={video.tags}
            category={video.category}
          />

          <CommentSection videoId={video.id} />
        </div>

        <div className="space-y-6">
          <RelatedVideos currentVideoId={video.id} category={video.category} tags={video.tags} />
        </div>
      </div>
    </div>
  )
}


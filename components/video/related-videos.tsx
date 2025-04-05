import { getPublicVideos } from "@/lib/videos"
import { VideoCard } from "@/components/video/video-card"

interface RelatedVideosProps {
  currentVideoId: string
  category?: string
  tags?: string[]
}

export async function RelatedVideos({ currentVideoId, category, tags }: RelatedVideosProps) {
  // Get related videos based on category and tags
  const { videos } = await getPublicVideos(6)

  // Filter out the current video
  const relatedVideos = videos.filter((video) => video.id !== currentVideoId)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Related Videos</h2>

      {relatedVideos.length > 0 ? (
        <div className="space-y-4">
          {relatedVideos.map((video) => (
            <VideoCard key={video.id} video={video} showCreator={true} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No related videos found</p>
      )}
    </div>
  )
}


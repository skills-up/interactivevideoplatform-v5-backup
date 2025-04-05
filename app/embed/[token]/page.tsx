import { notFound } from "next/navigation"
import dbConnect from "@/lib/db/connect"
import ShareLink from "@/models/ShareLink"
import Video from "@/models/Video"
import { SharedVideoPlayer } from "@/components/video/shared-video-player"
import { PasswordProtection } from "@/components/video/password-protection"

interface EmbedVideoPageProps {
  params: {
    token: string
  }
  searchParams: {
    password?: string
  }
}

export default async function EmbedVideoPage({ params, searchParams }: EmbedVideoPageProps) {
  await dbConnect()

  // Find the share link
  const shareLink = await ShareLink.findOne({ token: params.token })
  if (!shareLink) {
    notFound()
  }

  // Check if embedding is allowed
  if (!shareLink.settings.allowEmbedding) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Embedding Disabled</h1>
          <p className="text-gray-600">The owner of this video has disabled embedding.</p>
        </div>
      </div>
    )
  }

  // Check if the link has expired
  if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-800 mb-2">Link Expired</h1>
          <p className="text-red-600">This shared video link has expired and is no longer available.</p>
        </div>
      </div>
    )
  }

  // Check if password protected
  const providedPassword = searchParams.password
  const isPasswordProtected = !!shareLink.settings.password
  const isPasswordValid = !isPasswordProtected || (providedPassword && providedPassword === shareLink.settings.password)

  if (isPasswordProtected && !isPasswordValid) {
    return <PasswordProtection token={params.token} isEmbed={true} />
  }

  // Find the video
  const video = await Video.findById(shareLink.videoId)
  if (!video) {
    notFound()
  }

  // Track view if enabled
  if (shareLink.settings.trackViews) {
    shareLink.views = (shareLink.views || 0) + 1
    shareLink.lastViewedAt = new Date()
    await shareLink.save()
  }

  return (
    <div className="w-full h-full">
      <SharedVideoPlayer
        videoId={video._id.toString()}
        shareToken={params.token}
        sourceUrl={video.sourceUrl}
        sourceType={video.sourceType}
        title={video.title}
        isOwner={false}
        settings={shareLink.settings}
        isEmbed={true}
      />
    </div>
  )
}

export const metadata = {
  title: "Embedded Video",
  description: "Interactive video embed",
}


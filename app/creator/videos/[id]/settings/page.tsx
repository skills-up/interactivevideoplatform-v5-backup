import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { VideoSettingsForm } from "@/components/creator/videos/video-settings-form"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"

interface VideoSettingsPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: VideoSettingsPageProps): Promise<Metadata> {
  const params = await props.params;
  try {
    await dbConnect()

    const video = await Video.findById(params.id)

    if (!video) {
      return {
        title: "Video Not Found",
        description: "The requested video could not be found.",
      }
    }

    return {
      title: `${video.title} Settings | Interactive Video Platform`,
      description: "Configure interaction settings for your video.",
    }
  } catch (error) {
    return {
      title: "Video Settings",
      description: "Configure interaction settings for your video.",
    }
  }
}

export default async function VideoSettingsPage(props: VideoSettingsPageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/login?callbackUrl=/creator/videos/${params.id}/settings`)
  }

  await dbConnect()

  // Check if video exists and user has access
  const video = await Video.findOne({
    _id: params.id,
    $or: [{ userId: session.user.id }, { collaborators: { $in: [session.user.id] } }],
  })

  if (!video) {
    notFound()
  }

  // Get video settings or default settings if not set
  const settings = video.settings || {
    autoPlayInteractions: true,
    pauseOnInteraction: true,
    showFeedbackImmediately: true,
    allowSkipping: true,
    requireInteractionCompletion: false,
    defaultInteractionDuration: 10,
    interactionDisplayMode: "overlay",
    interactionPosition: "center",
    interactionSize: "medium",
  }

  return (
    <div className="container py-10">
      <VideoSettingsForm videoId={params.id} initialSettings={settings} videoTitle={video.title} />
    </div>
  )
}


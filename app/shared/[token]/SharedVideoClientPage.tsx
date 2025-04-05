"use client"

import { SharedVideoPlayer } from "@/components/video/shared-video-player"
import { PasswordProtection } from "@/components/video/password-protection"
import { notFound } from "next/navigation"
import { useState, useEffect } from "react"

interface SharedVideoPageProps {
  params: {
    token: string
  }
  searchParams: {
    password?: string
  }
}

export default function SharedVideoClientPage({ params, searchParams }: SharedVideoPageProps) {
  const [shareLink, setShareLink] = useState<any>(null)
  const [video, setVideo] = useState<any>(null)
  const [videoOwner, setVideoOwner] = useState<any>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch share link data
        const shareLinkResponse = await fetch(`/api/share-links/${params.token}`)
        if (!shareLinkResponse.ok) {
          notFound()
          return
        }
        const shareLinkData = await shareLinkResponse.json()
        setShareLink(shareLinkData)

        // Check if the link has expired
        if (shareLinkData.expiresAt && new Date() > new Date(shareLinkData.expiresAt)) {
          setLoading(false)
          return
        }

        // Fetch video data
        const videoResponse = await fetch(`/api/videos/${shareLinkData.videoId}`)
        if (!videoResponse.ok) {
          notFound()
          return
        }
        const videoData = await videoResponse.json()
        setVideo(videoData)

        // Fetch video owner data
        const videoOwnerResponse = await fetch(`/api/users/${videoData.userId}`)
        const videoOwnerData = await videoOwnerResponse.json()
        setVideoOwner(videoOwnerData)

        // Check if the current user is the video owner
        const sessionResponse = await fetch("/api/auth/session")
        const sessionData = await sessionResponse.json()
        setIsOwner(sessionData?.user?.id === videoData.userId)

        // Track view if enabled
        if (shareLinkData.settings.trackViews) {
          await fetch(`/api/share-links/${params.token}/view`, {
            method: "POST",
          })
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        notFound()
      }
    }

    fetchData()
  }, [params.token])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!shareLink) {
    notFound()
  }

  // Check if the link has expired
  if (shareLink.expiresAt && new Date() > new Date(shareLink.expiresAt)) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
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
    return <PasswordProtection token={params.token} />
  }

  if (!video) {
    notFound()
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
        {videoOwner && (
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <img
                src={videoOwner.image || "/images/default-avatar.png"}
                alt={videoOwner.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-gray-600">{videoOwner.name}</span>
          </div>
        )}
        {video.description && <p className="text-gray-600">{video.description}</p>}
      </div>

      <SharedVideoPlayer
        videoId={video._id}
        shareToken={params.token}
        sourceUrl={video.sourceUrl}
        sourceType={video.sourceType}
        title={video.title}
        isOwner={isOwner}
        settings={shareLink.settings}
      />

      {shareLink.settings.allowSharing && (
        <div className="mt-6 p-4 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Share this video</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={`${process.env.NEXT_PUBLIC_API_URL}/shared/${params.token}`}
              readOnly
              className="flex-1 p-2 border rounded-l-md"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_API_URL}/shared/${params.token}`)
              }}
              className="bg-primary text-white px-4 py-2 rounded-r-md"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {shareLink.settings.allowEmbedding && (
        <div className="mt-4 p-4 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Embed this video</h2>
          <div className="flex items-center">
            <textarea
              readOnly
              className="flex-1 p-2 border rounded-l-md font-mono text-sm h-24"
              value={`<iframe 
  width="${shareLink.settings.embedWidth}" 
  height="${shareLink.settings.embedHeight}" 
  src="${process.env.NEXT_PUBLIC_API_URL}/embed/${params.token}" 
  frameborder="0" 
  allowfullscreen
  ${shareLink.settings.autoplay ? 'allow="autoplay"' : ""}
></iframe>`}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `<iframe 
  width="${shareLink.settings.embedWidth}" 
  height="${shareLink.settings.embedHeight}" 
  src="${process.env.NEXT_PUBLIC_API_URL}/embed/${params.token}" 
  frameborder="0" 
  allowfullscreen
  ${shareLink.settings.autoplay ? 'allow="autoplay"' : ""}
></iframe>`,
                )
              }}
              className="bg-primary text-white px-4 py-2 rounded-r-md h-24"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {shareLink.settings.allowDownload && video.downloadUrl && (
        <div className="mt-4 p-4 border rounded-md">
          <h2 className="text-lg font-medium mb-2">Download this video</h2>
          <a
            href={video.downloadUrl}
            download={`${video.title}.mp4`}
            className="bg-primary text-white px-4 py-2 rounded-md inline-block"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AdBannerProps {
  format: "banner" | "sidebar"
  videoId?: string
  className?: string
}

export function AdBanner({ format, videoId, className = "" }: AdBannerProps) {
  const [ad, setAd] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setIsLoading(true)

        const params = new URLSearchParams({
          format,
        })

        if (videoId) {
          params.append("videoId", videoId)
        }

        const response = await fetch(`/api/ads/serve?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch ad")
        }

        const data = await response.json()

        if (data.ads && data.ads.length > 0) {
          setAd(data.ads[0])
        } else {
          setAd(null)
        }
      } catch (err) {
        console.error("Error fetching ad:", err)
        setError("Failed to load advertisement")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAd()
  }, [format, videoId])

  const handleClick = async () => {
    if (!ad) return

    // Record click
    try {
      await fetch("/api/ads/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adId: ad.id,
          impressionId: ad.impressionId,
          videoId,
        }),
      })

      // Open target URL in new tab
      window.open(ad.targetUrl, "_blank")
    } catch (err) {
      console.error("Error recording ad click:", err)
    }
  }

  if (isLoading) {
    return (
      <div className={`ad-container ${className} bg-gray-100 animate-pulse`}>
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-gray-400">Advertisement</span>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return null
  }

  return (
    <div className={`ad-container ${className} relative`}>
      <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs px-1 py-0.5 opacity-70 z-10">Ad</div>
      <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {ad.type === "image" && (
          <img src={ad.url || "/placeholder.svg"} alt="Advertisement" className="w-full h-auto object-cover" />
        )}
        {ad.type === "video" && (
          <video src={ad.url} className="w-full h-auto object-cover" autoPlay muted loop playsInline />
        )}
      </a>
    </div>
  )
}


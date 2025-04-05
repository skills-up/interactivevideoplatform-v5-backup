// Detect video source type from URL
export function detectSourceType(url: string): "youtube" | "vimeo" | "dailymotion" | "local" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube"
  } else if (url.includes("vimeo.com")) {
    return "vimeo"
  } else if (url.includes("dailymotion.com")) {
    return "dailymotion"
  } else {
    return "local"
  }
}

// Extract video ID from URL
export function extractVideoId(url: string, sourceType: "youtube" | "vimeo" | "dailymotion" | "local"): string {
  switch (sourceType) {
    case "youtube":
      if (url.includes("youtube.com/watch?v=")) {
        return new URL(url).searchParams.get("v") || ""
      } else if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1].split("?")[0]
      }
      return ""
    case "vimeo":
      if (url.includes("vimeo.com/")) {
        return url.split("vimeo.com/")[1].split("?")[0]
      }
      return ""
    case "dailymotion":
      if (url.includes("dailymotion.com/video/")) {
        return url.split("dailymotion.com/video/")[1].split("?")[0]
      }
      return ""
    default:
      return url
  }
}

// Convert to embed URL
export function getEmbedUrl(url: string, sourceType: "youtube" | "vimeo" | "dailymotion" | "local"): string {
  const videoId = extractVideoId(url, sourceType)

  switch (sourceType) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}`
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}`
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${videoId}`
    default:
      return url
  }
}

// Get video thumbnail URL
export function getVideoThumbnail(url: string, sourceType: "youtube" | "vimeo" | "dailymotion" | "local"): string {
  const videoId = extractVideoId(url, sourceType)

  switch (sourceType) {
    case "youtube":
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    case "vimeo":
      // Vimeo requires an API call to get the thumbnail
      return "/placeholder.svg?height=200&width=300"
    case "dailymotion":
      return `https://www.dailymotion.com/thumbnail/video/${videoId}`
    default:
      return "/placeholder.svg?height=200&width=300"
  }
}


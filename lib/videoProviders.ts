import { z } from "zod"

// Define the metadata schema
const videoMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  duration: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  embedUrl: z.string(),
  provider: z.enum(["youtube", "vimeo", "dailymotion", "wistia", "other"]),
  providerVideoId: z.string(),
  tags: z.array(z.string()).optional(),
})

type VideoMetadata = z.infer<typeof videoMetadataSchema>

// YouTube ID extraction regex
const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i

// Vimeo ID extraction regex
const vimeoRegex =
  /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/i

// Dailymotion ID extraction regex
const dailymotionRegex = /(?:dailymotion\.com\/(?:video|hub)\/([^_]+))/i

// Wistia ID extraction regex
const wistiaRegex = /(?:wistia\.com\/(?:medias|embed)\/([^_]+))/i

/**
 * Fetches video metadata from various providers
 */
export async function fetchVideoMetadata(url: string): Promise<VideoMetadata | null> {
  // YouTube
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1]
    try {
      // In a real implementation, you would use the YouTube API
      // For this example, we'll simulate the API response
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.items && data.items.length > 0) {
        const item = data.items[0]
        return {
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          provider: "youtube",
          providerVideoId: videoId,
          tags: item.snippet.tags || [],
          duration: parseDuration(item.contentDetails.duration),
        }
      }
    } catch (error) {
      console.error("Error fetching YouTube metadata:", error)
    }

    // Fallback if API call fails
    return {
      title: "YouTube Video",
      description: "",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      provider: "youtube",
      providerVideoId: videoId,
    }
  }

  // Vimeo
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1]
    try {
      const apiUrl = `https://api.vimeo.com/videos/${videoId}`
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        },
      })
      const data = await response.json()

      return {
        title: data.name,
        description: data.description,
        thumbnailUrl: data.pictures.sizes[data.pictures.sizes.length - 1].link,
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        provider: "vimeo",
        providerVideoId: videoId,
        duration: data.duration,
      }
    } catch (error) {
      console.error("Error fetching Vimeo metadata:", error)
    }

    // Fallback if API call fails
    return {
      title: "Vimeo Video",
      description: "",
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      provider: "vimeo",
      providerVideoId: videoId,
    }
  }

  // Dailymotion
  const dailymotionMatch = url.match(dailymotionRegex)
  if (dailymotionMatch && dailymotionMatch[1]) {
    const videoId = dailymotionMatch[1]
    try {
      const apiUrl = `https://api.dailymotion.com/video/${videoId}?fields=title,description,thumbnail_url,duration`
      const response = await fetch(apiUrl)
      const data = await response.json()

      return {
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnail_url,
        embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
        provider: "dailymotion",
        providerVideoId: videoId,
        duration: data.duration,
      }
    } catch (error) {
      console.error("Error fetching Dailymotion metadata:", error)
    }

    // Fallback if API call fails
    return {
      title: "Dailymotion Video",
      description: "",
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      provider: "dailymotion",
      providerVideoId: videoId,
    }
  }

  // Wistia
  const wistiaMatch = url.match(wistiaRegex)
  if (wistiaMatch && wistiaMatch[1]) {
    const videoId = wistiaMatch[1]
    try {
      const apiUrl = `https://fast.wistia.com/oembed?url=https://home.wistia.com/medias/${videoId}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      return {
        title: data.title,
        description: data.description || "",
        thumbnailUrl: data.thumbnail_url,
        embedUrl: `https://fast.wistia.com/embed/iframe/${videoId}`,
        provider: "wistia",
        providerVideoId: videoId,
        duration: data.duration,
      }
    } catch (error) {
      console.error("Error fetching Wistia metadata:", error)
    }

    // Fallback if API call fails
    return {
      title: "Wistia Video",
      description: "",
      embedUrl: `https://fast.wistia.com/embed/iframe/${videoId}`,
      provider: "wistia",
      providerVideoId: videoId,
    }
  }

  // If no provider matched
  return null
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

  const hours = match && match[1] ? Number.parseInt(match[1].replace("H", "")) : 0
  const minutes = match && match[2] ? Number.parseInt(match[2].replace("M", "")) : 0
  const seconds = match && match[3] ? Number.parseInt(match[3].replace("S", "")) : 0

  return hours * 3600 + minutes * 60 + seconds
}


import { toast } from "@/components/ui/use-toast"

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request error:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
      variant: "destructive",
    })
    throw error
  }
}

// Video API endpoints
export interface Video {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  sourceUrl: string
  sourceType: "youtube" | "vimeo" | "dailymotion" | "local"
  duration?: number
  createdAt: string
  updatedAt: string
  userId: string
  isPublic: boolean
  views: number
}

export interface VideoCreateInput {
  title: string
  description?: string
  thumbnailUrl?: string
  sourceUrl: string
  sourceType: "youtube" | "vimeo" | "dailymotion" | "local"
  isPublic?: boolean
}

export interface VideoUpdateInput {
  title?: string
  description?: string
  thumbnailUrl?: string
  sourceUrl?: string
  sourceType?: "youtube" | "vimeo" | "dailymotion" | "local"
  isPublic?: boolean
}

export async function getVideos(): Promise<Video[]> {
  return fetchAPI<Video[]>("/videos")
}

export async function getVideo(id: string): Promise<Video> {
  return fetchAPI<Video>(`/videos/${id}`)
}

export async function createVideo(data: VideoCreateInput): Promise<Video> {
  return fetchAPI<Video>("/videos", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateVideo(id: string, data: VideoUpdateInput): Promise<Video> {
  return fetchAPI<Video>(`/videos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteVideo(id: string): Promise<void> {
  return fetchAPI<void>(`/videos/${id}`, {
    method: "DELETE",
  })
}

// Interactive Elements API endpoints
export interface InteractiveElement {
  id: string
  videoId: string
  type: "quiz" | "poll" | "hotspot" | "decision" | "image-hotspot"
  title: string
  description?: string
  timestamp: number
  duration: number
  position?: {
    x: number
    y: number
  }
  style?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  optionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  options?: Array<{
    id: string
    text: string
    isCorrect?: boolean
    action?: string
    imageUrl?: string
    position?: {
      x: number
      y: number
    }
  }>
  feedback?: {
    correct?: string
    incorrect?: string
  }
  createdAt: string
  updatedAt: string
}

export interface InteractiveElementInput {
  videoId: string
  type: "quiz" | "poll" | "hotspot" | "decision" | "image-hotspot"
  title: string
  description?: string
  timestamp: number
  duration: number
  position?: {
    x: number
    y: number
  }
  style?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  optionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  options?: Array<{
    text: string
    isCorrect?: boolean
    action?: string
    imageUrl?: string
    position?: {
      x: number
      y: number
    }
  }>
  feedback?: {
    correct?: string
    incorrect?: string
  }
}

export async function getVideoInteractiveElements(videoId: string): Promise<InteractiveElement[]> {
  return fetchAPI<InteractiveElement[]>(`/videos/${videoId}/interactive-elements`)
}

export async function getInteractiveElement(id: string): Promise<InteractiveElement> {
  return fetchAPI<InteractiveElement>(`/interactive-elements/${id}`)
}

export async function createInteractiveElement(data: InteractiveElementInput): Promise<InteractiveElement> {
  return fetchAPI<InteractiveElement>("/interactive-elements", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateInteractiveElement(
  id: string,
  data: Partial<InteractiveElementInput>,
): Promise<InteractiveElement> {
  return fetchAPI<InteractiveElement>(`/interactive-elements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteInteractiveElement(id: string): Promise<void> {
  return fetchAPI<void>(`/interactive-elements/${id}`, {
    method: "DELETE",
  })
}

// Video Settings API endpoints
export interface VideoSettings {
  id: string
  videoId: string
  pauseOnInteraction: boolean
  showFeedback: boolean
  autoAdvance: boolean
  defaultStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  defaultOptionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  createdAt: string
  updatedAt: string
  webhookUrl?: string
  preventReattempt?: boolean
}

export interface VideoSettingsInput {
  pauseOnInteraction: boolean
  showFeedback: boolean
  autoAdvance: boolean
  defaultStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  defaultOptionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  webhookUrl?: string
  preventReattempt?: boolean
}

export async function getVideoSettings(videoId: string): Promise<VideoSettings> {
  return fetchAPI<VideoSettings>(`/videos/${videoId}/settings`)
}

export async function updateVideoSettings(videoId: string, data: VideoSettingsInput): Promise<VideoSettings> {
  return fetchAPI<VideoSettings>(`/videos/${videoId}/settings`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Templates API endpoints
export interface Template {
  id: string
  name: string
  description: string
  type: "interaction" | "ui"
  style?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  optionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  position?: {
    x: number
    y: number
  }
  layout?: string
  theme?: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
  isBuiltIn: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface TemplateInput {
  name: string
  description: string
  type: "interaction" | "ui"
  style?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  optionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  position?: {
    x: number
    y: number
  }
  layout?: string
  theme?: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
}

export async function getTemplates(type?: "interaction" | "ui"): Promise<Template[]> {
  const endpoint = type ? `/templates?type=${type}` : "/templates"
  return fetchAPI<Template[]>(endpoint)
}

export async function getTemplate(id: string): Promise<Template> {
  return fetchAPI<Template>(`/templates/${id}`)
}

export async function createTemplate(data: TemplateInput): Promise<Template> {
  return fetchAPI<Template>("/templates", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateTemplate(id: string, data: Partial<TemplateInput>): Promise<Template> {
  return fetchAPI<Template>(`/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  return fetchAPI<void>(`/templates/${id}`, {
    method: "DELETE",
  })
}

// User API endpoints
export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: "user" | "admin"
  createdAt: string
  updatedAt: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await fetchAPI<User>("/users/me")
  } catch (error) {
    return null
  }
}

// Analytics API endpoints
export interface VideoAnalytics {
  videoId: string
  views: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  interactionRate: number
  interactionBreakdown: Record<string, number>
}

export async function getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
  return fetchAPI<VideoAnalytics>(`/analytics/videos/${videoId}`)
}

export interface InteractionAttempt {
  videoId: string
  interactionId: string
  userId: string
  optionId: string
  isCorrect?: boolean | null
  timestamp: string
}

export async function recordInteractionAttempt(data: InteractionAttempt): Promise<InteractionAttempt> {
  return fetchAPI<InteractionAttempt>("/interactions", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Affiliate API endpoints
export async function getAffiliateProgram(): Promise<any> {
  return fetchAPI<any>("/affiliate/program")
}

export async function joinAffiliateProgram(data: any): Promise<any> {
  return fetchAPI<any>("/affiliate/join", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function fetchAffiliateDashboard(): Promise<any> {
  return fetchAPI<any>("/affiliate/dashboard")
}

export async function getAffiliateReferrals(page: number, limit: number): Promise<any> {
  return fetchAPI<any>(`/affiliate/referrals?page=${page}&limit=${limit}`)
}

export async function getAffiliateCommissions(page: number, limit: number, status?: string): Promise<any> {
  let url = `/affiliate/commissions?page=${page}&limit=${limit}`
  if (status) {
    url += `&status=${status}`
  }
  return fetchAPI<any>(url)
}

export async function getAffiliateSettings(): Promise<any> {
  return fetchAPI<any>("/affiliate/settings")
}

export async function updateAffiliateSettings(data: any): Promise<any> {
  return fetchAPI<any>("/affiliate/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function createPayoutRequest(data: any): Promise<any> {
  return fetchAPI<any>("/affiliate/payouts", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Mock API implementation for development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Mock data and handlers would go here
  // This is just a placeholder for actual backend integration
  console.log("Using mock API implementation for development")
}


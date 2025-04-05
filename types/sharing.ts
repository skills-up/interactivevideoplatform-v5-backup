export interface ShareSettings {
  allowSharing: boolean
  allowEmbedding: boolean
  embedWidth: number
  embedHeight: number
  autoplay: boolean
  showControls: boolean
  startTime?: number
  endTime?: number
  showInteractions: boolean
  allowInteractionSubmissions: boolean
}

export interface ShareLink {
  id: string
  videoId: string
  userId: string
  settings: ShareSettings
  accessKey: string
  views: number
  createdAt: Date
  expiresAt?: Date
}

export interface EmbedCode {
  html: string
  iframeCode: string
  scriptCode: string
}


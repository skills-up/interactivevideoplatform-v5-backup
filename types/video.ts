export interface Video {
  id: string
  title: string
  description?: string
  url: string
  thumbnailUrl?: string
  duration?: number
  views: number
  likes: number
  creator: {
    id: string
    name: string
    email?: string
  }
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  category?: string
  visibility: "public" | "unlisted" | "private"
  interactions?: Interaction[]
  type?: string

  // Analytics
  viewsHistory?: {
    date: Date
    count: number
  }[]

  // Interaction settings
  interactionSettings?: {
    behavior: {
      pauseOnInteraction: boolean
      resumeAfterInteraction: boolean
      skipAfterSeconds: number
      allowSkipping: boolean
      showProgressBar: boolean
      showCompletionStatus: boolean
    }
    appearance: {
      defaultPosition: string
      animationIn: string
      animationOut: string
      backdropOpacity: number
      maxWidth: string
      zIndex: number
    }
    analytics: {
      trackInteractions: boolean
      trackCompletions: boolean
      trackSkips: boolean
      requireAuthentication: boolean
    }
    accessibility: {
      keyboardNavigation: boolean
      screenReaderSupport: boolean
      highContrastMode: boolean
      textToSpeech: boolean
    }
  }
}

export interface Interaction {
  id: string
  type: string
  title?: string
  question?: string
  options?: {
    id: string
    text: string
    isCorrect?: boolean
    action?: string
    timeCode?: number
  }[]
  startTime: number
  endTime?: number
  showOnce?: boolean
  correctFeedback?: string
  incorrectFeedback?: string
  style?: {
    position?: string
    backgroundColor?: string
    textColor?: string
    borderColor?: string
    borderWidth?: string
    borderStyle?: string
    borderRadius?: string
    padding?: string
    boxShadow?: string
    fontFamily?: string
    fontSize?: string
    width?: string
    maxWidth?: string
    opacity?: number
    optionStyle?: {
      backgroundColor?: string
      textColor?: string
      borderColor?: string
      borderRadius?: string
      correctBackgroundColor?: string
      incorrectBackgroundColor?: string
    }
    poll?: {
      barColor?: string
    }
  }
}


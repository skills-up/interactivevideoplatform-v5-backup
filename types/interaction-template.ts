export interface InteractionTemplate {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  userId: string
  isPublic: boolean
  isDefault?: boolean
  type: "quiz" | "poll" | "hotspot" | "branching" | "imageHotspot"

  // Style settings
  style: {
    backgroundColor?: string
    textColor?: string
    titleColor?: string
    borderColor?: string
    borderRadius?: string
    width?: string
    maxWidth?: string
    padding?: string
    boxShadow?: string
    fontFamily?: string
    fontSize?: string
    customCSS?: string
  }

  // Type-specific settings
  settings: {
    // Quiz settings
    quiz?: {
      showFeedback: boolean
      defaultCorrectFeedback: string
      defaultIncorrectFeedback: string
      optionStyle: {
        backgroundColor?: string
        textColor?: string
        borderColor?: string
        borderRadius?: string
        selectedBackgroundColor?: string
        correctBackgroundColor?: string
        incorrectBackgroundColor?: string
      }
    }

    // Poll settings
    poll?: {
      showResults: boolean
      barColor?: string
      barBackgroundColor?: string
    }

    // Hotspot settings
    hotspot?: {
      defaultHotspotSize: number
      hotspotStyle: {
        borderColor?: string
        backgroundColor?: string
        borderWidth?: string
        borderStyle?: string
      }
    }

    // Branching settings
    branching?: {
      optionStyle: {
        backgroundColor?: string
        textColor?: string
        borderColor?: string
        borderRadius?: string
        hoverBackgroundColor?: string
      }
    }

    // Image hotspot settings
    imageHotspot?: {
      hotspotStyle: {
        size?: string
        backgroundColor?: string
        textColor?: string
        borderColor?: string
        activeBackgroundColor?: string
      }
      contentStyle: {
        backgroundColor?: string
        textColor?: string
        borderColor?: string
        borderRadius?: string
      }
    }
  }

  // Default behavior settings
  behavior: {
    pauseVideo: boolean
    allowSkipping: boolean
    resumeAfterCompletion: boolean
    allowResubmission: boolean
  }
}


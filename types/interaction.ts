// Interaction Types

// Base interactive element option
export interface InteractiveElementOption {
  id: string
  text: string
  action?: string
  isCorrect?: boolean
}

// Base interactive element
export interface InteractiveElement {
  id: string
  videoId: string
  type: "quiz" | "poll" | "hotspot" | "decision" | "form" | "info" | "image" | "link"
  title: string
  description?: string
  timestamp: number
  duration: number
  options?: InteractiveElementOption[]
  position?: {
    x: number
    y: number
  }
  style?: InteractionStyle
  optionStyle?: InteractionOptionStyle
  feedback?: {
    correct?: string
    incorrect?: string
  }
  pauseVideo?: boolean
  required?: boolean
  createdAt: string
  updatedAt: string
}

// Interaction style
export interface InteractionStyle {
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: string
  fontSize: string
  padding: string
  opacity: string
}

// Interaction option style
export interface InteractionOptionStyle {
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: string
  hoverColor: string
}

// Quiz interaction
export interface QuizInteraction extends InteractiveElement {
  type: "quiz"
  options: InteractiveElementOption[]
  feedback: {
    correct: string
    incorrect: string
  }
  showCorrectAnswer?: boolean
  allowRetry?: boolean
  shuffleOptions?: boolean
}

// Poll interaction
export interface PollInteraction extends InteractiveElement {
  type: "poll"
  options: InteractiveElementOption[]
  showResults?: boolean
  allowMultipleAnswers?: boolean
}

// Hotspot interaction
export interface HotspotInteraction extends InteractiveElement {
  type: "hotspot"
  position: {
    x: number
    y: number
  }
  size?: {
    width: number
    height: number
  }
  shape?: "circle" | "rectangle"
}

// Decision interaction
export interface DecisionInteraction extends InteractiveElement {
  type: "decision"
  options: InteractiveElementOption[]
}

// Form interaction
export interface FormInteraction extends InteractiveElement {
  type: "form"
  fields: {
    id: string
    type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio"
    label: string
    placeholder?: string
    required?: boolean
    options?: { value: string; label: string }[]
  }[]
  submitButtonText: string
}

// Info interaction
export interface InfoInteraction extends InteractiveElement {
  type: "info"
  dismissable?: boolean
  dismissButtonText?: string
}

// Image interaction
export interface ImageInteraction extends InteractiveElement {
  type: "image"
  imageUrl: string
  altText?: string
  linkUrl?: string
}

// Link interaction
export interface LinkInteraction extends InteractiveElement {
  type: "link"
  url: string
  openInNewTab?: boolean
}

// Interaction attempt
export interface InteractionAttempt {
  id: string
  userId: string
  videoId: string
  interactionId: string
  optionId: string
  isCorrect?: boolean
  createdAt: string
}

// Video settings for interactions
export interface VideoInteractionSettings {
  pauseOnInteraction: boolean
  showFeedback: boolean
  autoAdvance: boolean
  defaultStyle?: InteractionStyle
  defaultOptionStyle?: InteractionOptionStyle
  preventSkipping?: boolean
  requireCompletion?: boolean
}


import mongoose, { type Document, Schema } from "mongoose"

// Interface for interactive elements
interface IInteractiveElement {
  type: "quiz" | "decision" | "hotspot" | "poll"
  title: string
  description?: string
  timestamp: number // When the element appears in the video (in seconds)
  duration: number // How long the element is displayed (in seconds)
  options?: Array<{
    text: string
    action?: string // e.g., "jump:120" to jump to 2:00 in the video
    isCorrect?: boolean // For quizzes
  }>
  position?: {
    x: number // Percentage position (0-100)
    y: number // Percentage position (0-100)
  }
}

export interface IVideo extends Document {
  title: string
  description: string
  creator: mongoose.Types.ObjectId
  source: "youtube" | "dailymotion" | "vimeo" | "local"
  sourceUrl: string // URL for external videos or path for local videos
  thumbnail: string
  duration: number // In seconds
  views: number
  interactiveElements: IInteractiveElement[]
  tags: string[]
  visibility: "public" | "private" | "unlisted"
  seasons: mongoose.Types.ObjectId[] // References to seasons this video belongs to
  createdAt: Date
  updatedAt: Date
}

const InteractiveElementSchema = new Schema({
  type: {
    type: String,
    enum: ["quiz", "decision", "hotspot", "poll"],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Number, required: true },
  duration: { type: Number, required: true },
  options: [
    {
      text: { type: String, required: true },
      action: { type: String },
      isCorrect: { type: Boolean },
    },
  ],
  position: {
    x: { type: Number },
    y: { type: Number },
  },
})

const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      enum: ["youtube", "dailymotion", "vimeo", "local"],
      required: true,
    },
    sourceUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },
    duration: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    interactiveElements: [InteractiveElementSchema],
    tags: [{ type: String }],
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    seasons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Season",
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema)


import mongoose, { type Document, Schema } from "mongoose"

export interface IInteraction extends Document {
  user: mongoose.Types.ObjectId
  video: mongoose.Types.ObjectId
  elementId: string // ID of the interactive element
  type: "quiz" | "decision" | "hotspot" | "poll"
  response: string // User's response (e.g., selected option)
  timestamp: number // When the interaction occurred (in seconds from video start)
  createdAt: Date
}

const InteractionSchema = new Schema<IInteraction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    elementId: { type: String, required: true },
    type: {
      type: String,
      enum: ["quiz", "decision", "hotspot", "poll"],
      required: true,
    },
    response: { type: String, required: true },
    timestamp: { type: Number, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.Interaction || mongoose.model<IInteraction>("Interaction", InteractionSchema)


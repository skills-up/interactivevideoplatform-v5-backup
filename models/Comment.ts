import mongoose, { type Document, Schema } from "mongoose"

export interface IComment extends Document {
  content: string
  user: mongoose.Types.ObjectId
  video: mongoose.Types.ObjectId
  likes: number
  parent?: mongoose.Types.ObjectId // For replies
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
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
    likes: { type: Number, default: 0 },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true },
)

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)


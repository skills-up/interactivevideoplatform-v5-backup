import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string // This would be hashed
  avatar?: string
  role: "viewer" | "creator" | "admin"
  subscribedSeries: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["viewer", "creator", "admin"],
      default: "viewer",
    },
    subscribedSeries: [
      {
        type: Schema.Types.ObjectId,
        ref: "Series",
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)


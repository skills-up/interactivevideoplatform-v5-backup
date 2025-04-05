import mongoose, { Schema, type Document } from "mongoose"
import type { AdClick as AdClickType } from "@/types/ad"

interface AdClickDocument extends Document, Omit<AdClickType, "id"> {}

const AdClickSchema = new Schema(
  {
    adId: { type: Schema.Types.ObjectId, required: true, ref: "Ad", index: true },
    impressionId: { type: Schema.Types.ObjectId, required: true, ref: "AdImpression" },
    userId: { type: String, index: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video" },
    timestamp: { type: Date, required: true, default: Date.now },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    country: { type: String },
    device: { type: String },
    referrer: { type: String },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      },
    },
  },
)

// Create compound index for analytics
AdClickSchema.index({ adId: 1, timestamp: 1 })

export default mongoose.models.AdClick || mongoose.model<AdClickDocument>("AdClick", AdClickSchema)


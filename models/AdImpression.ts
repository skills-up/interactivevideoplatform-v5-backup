import mongoose, { Schema, type Document } from "mongoose"
import type { AdImpression as AdImpressionType } from "@/types/ad"

interface AdImpressionDocument extends Document, Omit<AdImpressionType, "id"> {}

const AdImpressionSchema = new Schema(
  {
    adId: { type: Schema.Types.ObjectId, required: true, ref: "Ad", index: true },
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
AdImpressionSchema.index({ adId: 1, timestamp: 1 })

export default mongoose.models.AdImpression || mongoose.model<AdImpressionDocument>("AdImpression", AdImpressionSchema)


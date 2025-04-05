import mongoose, { Schema, type Document } from "mongoose"
import type { Ad as AdType } from "@/types/ad"

interface AdDocument extends Document, Omit<AdType, "id"> {}

const AdSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["video", "image", "gif"],
    },
    format: {
      type: String,
      required: true,
      enum: ["banner", "sidebar", "preroll", "midroll", "postroll", "overlay"],
    },
    url: { type: String, required: true },
    targetUrl: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "paused", "completed", "scheduled"],
      default: "scheduled",
    },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    advertiserId: { type: String, required: true },

    // Targeting options
    targetAudience: {
      countries: [{ type: String }],
      languages: [{ type: String }],
      ageGroups: [{ type: String }],
      interests: [{ type: String }],
      devices: [{ type: String }],
    },

    // For video ads
    duration: { type: Number },
    skipAfter: { type: Number },

    // For image/gif ads
    width: { type: Number },
    height: { type: Number },

    // For overlay ads
    position: {
      type: String,
      enum: ["top", "bottom", "left", "right", "center"],
    },

    // For all ads
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      },
    },
  },
)

export default mongoose.models.Ad || mongoose.model<AdDocument>("Ad", AdSchema)


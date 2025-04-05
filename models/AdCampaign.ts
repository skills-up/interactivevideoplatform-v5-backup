import mongoose, { Schema, type Document } from "mongoose"
import type { AdCampaign as AdCampaignType } from "@/types/ad"

interface AdCampaignDocument extends Document, Omit<AdCampaignType, "id"> {}

const AdCampaignSchema = new Schema(
  {
    name: { type: String, required: true },
    advertiserId: { type: String, required: true, index: true },
    budget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "paused", "completed", "scheduled"],
      default: "scheduled",
    },
    adIds: [{ type: Schema.Types.ObjectId, ref: "Ad" }],
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

export default mongoose.models.AdCampaign || mongoose.model<AdCampaignDocument>("AdCampaign", AdCampaignSchema)


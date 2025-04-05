import mongoose, { Schema, type Document } from "mongoose"
import type { PayoutRate as PayoutRateType } from "@/types/payout"

interface PayoutRateDocument extends Document, Omit<PayoutRateType, "id"> {}

const PayoutRateSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["view", "engagement", "subscription", "ad_impression", "ad_click"],
    },
    rate: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    effectiveDate: { type: Date, required: true },
    expirationDate: { type: Date },
    isActive: { type: Boolean, required: true, default: true },
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

export default mongoose.models.PayoutRate || mongoose.model<PayoutRateDocument>("PayoutRate", PayoutRateSchema)


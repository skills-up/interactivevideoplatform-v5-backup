import mongoose, { Schema, type Document } from "mongoose"
import type { PayoutSettings as PayoutSettingsType } from "@/types/payout"

interface PayoutSettingsDocument extends Document, Omit<PayoutSettingsType, "id"> {}

const PayoutSettingsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    minimumPayout: { type: Number, required: true, default: 50 },
    payoutFrequency: {
      type: String,
      required: true,
      enum: ["weekly", "biweekly", "monthly"],
      default: "monthly",
    },
    automaticPayouts: { type: Boolean, required: true, default: true },
    payoutDay: { type: Number, required: true, default: 1 },
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

export default mongoose.models.PayoutSettings ||
  mongoose.model<PayoutSettingsDocument>("PayoutSettings", PayoutSettingsSchema)


import mongoose, { Schema, type Document } from "mongoose"
import type { EarningsPeriod as EarningsPeriodType } from "@/types/payout"

interface EarningsPeriodDocument extends Document, Omit<EarningsPeriodType, "id"> {}

const EarningsPeriodSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "finalized"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true, default: 0 },
    viewsAmount: { type: Number, required: true, default: 0 },
    subscriptionsAmount: { type: Number, required: true, default: 0 },
    tipsAmount: { type: Number, required: true, default: 0 },
    salesAmount: { type: Number, required: true, default: 0 },
    otherAmount: { type: Number, required: true, default: 0 },
    finalizedAt: { type: Date },
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

export default mongoose.models.EarningsPeriod ||
  mongoose.model<EarningsPeriodDocument>("EarningsPeriod", EarningsPeriodSchema)


import mongoose, { Schema, type Document } from "mongoose"
import type { PayoutTransaction as PayoutTransactionType } from "@/types/payout"

interface PayoutTransactionDocument extends Document, Omit<PayoutTransactionType, "id"> {}

const PayoutTransactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    payoutAccountId: { type: Schema.Types.ObjectId, required: true, ref: "PayoutAccount" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    reference: { type: String, required: true, unique: true },
    description: { type: String },
    failureReason: { type: String },
    processedAt: { type: Date },
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

export default mongoose.models.PayoutTransaction ||
  mongoose.model<PayoutTransactionDocument>("PayoutTransaction", PayoutTransactionSchema)


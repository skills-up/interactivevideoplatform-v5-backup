import mongoose, { Schema, type Document } from "mongoose"
import type { SubscriptionInvoice as SubscriptionInvoiceType } from "@/types/subscription"

interface SubscriptionInvoiceDocument extends Document, Omit<SubscriptionInvoiceType, "id"> {}

const SubscriptionInvoiceSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, required: true, ref: "UserSubscription" },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    status: {
      type: String,
      required: true,
      enum: ["paid", "open", "void", "uncollectible"],
      default: "open",
    },
    invoiceUrl: { type: String },
    pdfUrl: { type: String },
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

export default mongoose.models.SubscriptionInvoice ||
  mongoose.model<SubscriptionInvoiceDocument>("SubscriptionInvoice", SubscriptionInvoiceSchema)


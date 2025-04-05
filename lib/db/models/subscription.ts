import mongoose, { type Document, Schema } from "mongoose"

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId
  series: mongoose.Types.ObjectId
  startDate: Date
  endDate?: Date // If subscription has ended
  status: "active" | "cancelled" | "expired"
  paymentId?: string // Reference to payment processor
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    series: {
      type: Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    paymentId: { type: String },
  },
  { timestamps: true },
)

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema)


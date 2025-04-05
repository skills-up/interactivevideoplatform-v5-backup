import mongoose, { Schema, type Document } from "mongoose"
import type { UserSubscription as UserSubscriptionType } from "@/types/subscription"

interface UserSubscriptionDocument extends Document, Omit<UserSubscriptionType, "id"> {}

const UserSubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    planId: { type: Schema.Types.ObjectId, required: true, ref: "SubscriptionPlan" },
    status: {
      type: String,
      required: true,
      enum: ["active", "canceled", "past_due", "trialing", "incomplete"],
      default: "active",
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    stripeSubscriptionId: { type: String },
    stripeCustomerId: { type: String },
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

export default mongoose.models.UserSubscription ||
  mongoose.model<UserSubscriptionDocument>("UserSubscription", UserSubscriptionSchema)


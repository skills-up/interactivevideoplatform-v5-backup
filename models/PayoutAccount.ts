import mongoose, { Schema, type Document } from "mongoose"
import type { PayoutAccount as PayoutAccountType } from "@/types/payout"

interface PayoutAccountDocument extends Document, Omit<PayoutAccountType, "id"> {}

const PayoutAccountSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["stripe", "paypal", "bank_transfer", "crypto"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    isDefault: { type: Boolean, default: false },

    // Stripe specific
    stripeConnectId: { type: String },

    // PayPal specific
    email: { type: String },

    // Bank transfer specific
    accountNumber: { type: String },
    routingNumber: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String },
    accountType: { type: String, enum: ["checking", "savings"] },

    // Crypto specific
    walletAddress: { type: String },
    cryptoCurrency: { type: String },
    network: { type: String },
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

// Ensure only one default account per user
PayoutAccountSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany({ userId: this.userId, _id: { $ne: this._id } }, { $set: { isDefault: false } })
  }
  next()
})

export default mongoose.models.PayoutAccount ||
  mongoose.model<PayoutAccountDocument>("PayoutAccount", PayoutAccountSchema)


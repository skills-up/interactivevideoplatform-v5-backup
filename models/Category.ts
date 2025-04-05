import mongoose, { Schema, type Document } from "mongoose"

interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  icon?: string
  order: number
  videoCount?: number
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    order: { type: Number, default: 1 },
    videoCount: { type: Number, default: 0 },
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

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)


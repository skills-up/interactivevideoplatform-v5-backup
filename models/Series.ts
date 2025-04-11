import mongoose, { type Document, Schema } from "mongoose"

export interface ISeason extends Document {
  title: string
  description?: string
  series: mongoose.Types.ObjectId
  episodes: mongoose.Types.ObjectId[] // References to videos
  order: number // Order in the series
  createdAt: Date
  updatedAt: Date
}

export interface ISeries extends Document {
  title: string
  description: string
  creator: mongoose.Types.ObjectId
  thumbnail: string
  price: number // Monthly subscription price
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SeasonSchema = new Schema<ISeason>(
  {
    title: { type: String, required: true },
    description: { type: String },
    series: {
      type: Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    episodes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    order: { type: Number, default: 1 },
  },
  { timestamps: true },
)

const SeriesSchema = new Schema<ISeries>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Season = mongoose.models.Season || mongoose.model<ISeason>("Season", SeasonSchema)
export const Series = mongoose.models.Series || mongoose.model<ISeries>("Series", SeriesSchema)


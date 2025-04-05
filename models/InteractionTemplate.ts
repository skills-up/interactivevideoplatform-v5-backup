import mongoose, { Schema, type Document } from "mongoose"
import type { InteractionTemplate } from "@/types/interaction-template"

const InteractionTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isPublic: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ["quiz", "poll", "hotspot", "branching", "imageHotspot"],
    required: true,
  },

  style: {
    backgroundColor: { type: String },
    textColor: { type: String },
    titleColor: { type: String },
    borderColor: { type: String },
    borderRadius: { type: String },
    width: { type: String },
    maxWidth: { type: String },
    padding: { type: String },
    boxShadow: { type: String },
    fontFamily: { type: String },
    fontSize: { type: String },
    customCSS: { type: String },
  },

  settings: {
    quiz: {
      showFeedback: { type: Boolean, default: true },
      defaultCorrectFeedback: { type: String, default: "Correct!" },
      defaultIncorrectFeedback: { type: String, default: "Incorrect!" },
      optionStyle: {
        backgroundColor: { type: String },
        textColor: { type: String },
        borderColor: { type: String },
        borderRadius: { type: String },
        selectedBackgroundColor: { type: String },
        correctBackgroundColor: { type: String, default: "#d1fae5" },
        incorrectBackgroundColor: { type: String, default: "#fee2e2" },
      },
    },

    poll: {
      showResults: { type: Boolean, default: true },
      barColor: { type: String, default: "#3b82f6" },
      barBackgroundColor: { type: String, default: "#e5e7eb" },
    },

    hotspot: {
      defaultHotspotSize: { type: Number, default: 10 },
      hotspotStyle: {
        borderColor: { type: String, default: "#3b82f6" },
        backgroundColor: { type: String, default: "rgba(59, 130, 246, 0.2)" },
        borderWidth: { type: String, default: "2px" },
        borderStyle: { type: String, default: "dashed" },
      },
    },

    branching: {
      optionStyle: {
        backgroundColor: { type: String },
        textColor: { type: String },
        borderColor: { type: String },
        borderRadius: { type: String },
        hoverBackgroundColor: { type: String },
      },
    },

    imageHotspot: {
      hotspotStyle: {
        size: { type: String, default: "2rem" },
        backgroundColor: { type: String, default: "#3b82f6" },
        textColor: { type: String, default: "#ffffff" },
        borderColor: { type: String },
        activeBackgroundColor: { type: String, default: "#2563eb" },
      },
      contentStyle: {
        backgroundColor: { type: String, default: "#ffffff" },
        textColor: { type: String },
        borderColor: { type: String, default: "#e5e7eb" },
        borderRadius: { type: String, default: "0.375rem" },
      },
    },
  },

  behavior: {
    pauseVideo: { type: Boolean, default: true },
    allowSkipping: { type: Boolean, default: true },
    resumeAfterCompletion: { type: Boolean, default: true },
    allowResubmission: { type: Boolean, default: false },
  },
})

// Update the updatedAt field on save
InteractionTemplateSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.InteractionTemplate ||
  mongoose.model<InteractionTemplate & Document>("InteractionTemplate", InteractionTemplateSchema)


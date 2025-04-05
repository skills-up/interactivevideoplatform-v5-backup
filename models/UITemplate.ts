import mongoose, { Schema, type Document } from "mongoose"
import type { UITemplate as UITemplateType } from "@/types/ui-template"

const UITemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Theme settings
  theme: {
    colors: {
      primary: { type: String, default: "#3b82f6" },
      secondary: { type: String, default: "#6366f1" },
      accent: { type: String, default: "#10b981" },
      background: { type: String, default: "#ffffff" },
      text: { type: String, default: "#1e293b" },
      muted: { type: String, default: "#64748b" },
      border: { type: String, default: "#e2e8f0" },
      input: { type: String, default: "#f8fafc" },
      card: { type: String, default: "#ffffff" },
      error: { type: String, default: "#ef4444" },
      success: { type: String, default: "#10b981" },
      warning: { type: String, default: "#f59e0b" },
      info: { type: String, default: "#0ea5e9" },
    },
    fonts: {
      body: { type: String, default: "'Inter', sans-serif" },
      heading: { type: String, default: "'Inter', sans-serif" },
      monospace: { type: String, default: "'Roboto Mono', monospace" },
    },
    borderRadius: { type: String, default: "0.5rem" },
    boxShadow: { type: String, default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" },
  },

  // Component styles
  components: {
    buttons: {
      primary: {
        backgroundColor: { type: String, default: "#3b82f6" },
        textColor: { type: String, default: "#ffffff" },
        hoverBackgroundColor: { type: String, default: "#2563eb" },
        hoverTextColor: { type: String, default: "#ffffff" },
        borderColor: { type: String, default: "transparent" },
        borderWidth: { type: String, default: "1px" },
        borderRadius: { type: String, default: "0.375rem" },
        padding: { type: String, default: "0.5rem 1rem" },
        fontSize: { type: String, default: "0.875rem" },
        fontWeight: { type: String, default: "500" },
        boxShadow: { type: String, default: "none" },
      },
      secondary: {
        backgroundColor: { type: String, default: "transparent" },
        textColor: { type: String, default: "#1e293b" },
        hoverBackgroundColor: { type: String, default: "#f1f5f9" },
        hoverTextColor: { type: String, default: "#1e293b" },
        borderColor: { type: String, default: "#e2e8f0" },
        borderWidth: { type: String, default: "1px" },
        borderRadius: { type: String, default: "0.375rem" },
        padding: { type: String, default: "0.5rem 1rem" },
        fontSize: { type: String, default: "0.875rem" },
        fontWeight: { type: String, default: "500" },
        boxShadow: { type: String, default: "none" },
      },
    },
    cards: {
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#1e293b" },
      borderColor: { type: String, default: "#e2e8f0" },
      borderWidth: { type: String, default: "1px" },
      borderRadius: { type: String, default: "0.5rem" },
      padding: { type: String, default: "1.5rem" },
      boxShadow: { type: String, default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)" },
    },
    inputs: {
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#1e293b" },
      borderColor: { type: String, default: "#e2e8f0" },
      borderWidth: { type: String, default: "1px" },
      borderRadius: { type: String, default: "0.375rem" },
      padding: { type: String, default: "0.5rem 0.75rem" },
      focusBorderColor: { type: String, default: "#3b82f6" },
      errorBorderColor: { type: String, default: "#ef4444" },
      placeholderColor: { type: String, default: "#94a3b8" },
    },
    interactions: {
      quiz: {
        backgroundColor: { type: String, default: "#ffffff" },
        textColor: { type: String, default: "#1e293b" },
        borderColor: { type: String, default: "#e2e8f0" },
        borderRadius: { type: String, default: "0.5rem" },
        correctColor: { type: String, default: "#10b981" },
        incorrectColor: { type: String, default: "#ef4444" },
      },
      poll: {
        backgroundColor: { type: String, default: "#ffffff" },
        textColor: { type: String, default: "#1e293b" },
        barColor: { type: String, default: "#3b82f6" },
        barBackgroundColor: { type: String, default: "#e2e8f0" },
      },
      hotspot: {
        backgroundColor: { type: String, default: "#3b82f6" },
        textColor: { type: String, default: "#ffffff" },
        borderColor: { type: String, default: "transparent" },
        borderRadius: { type: String, default: "0.375rem" },
        size: { type: String, default: "2rem" },
        hoverBackgroundColor: { type: String, default: "#2563eb" },
      },
      branching: {
        backgroundColor: { type: String, default: "#ffffff" },
        textColor: { type: String, default: "#1e293b" },
        borderColor: { type: String, default: "#e2e8f0" },
        borderRadius: { type: String, default: "0.5rem" },
        optionBackgroundColor: { type: String, default: "#f8fafc" },
        optionTextColor: { type: String, default: "#1e293b" },
      },
    },
  },

  // Layout settings
  layout: {
    header: {
      height: { type: String, default: "4rem" },
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#1e293b" },
      logoSize: { type: String, default: "2rem" },
      padding: { type: String, default: "0 1.5rem" },
    },
    sidebar: {
      width: { type: String, default: "16rem" },
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#1e293b" },
      activeItemBackgroundColor: { type: String, default: "#f1f5f9" },
      activeItemTextColor: { type: String, default: "#3b82f6" },
      hoverItemBackgroundColor: { type: String, default: "#f8fafc" },
      hoverItemTextColor: { type: String, default: "#1e293b" },
    },
    footer: {
      height: { type: String, default: "4rem" },
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#64748b" },
      padding: { type: String, default: "0 1.5rem" },
    },
    content: {
      padding: { type: String, default: "1.5rem" },
      maxWidth: { type: String, default: "1200px" },
    },
  },
})

// Update the updatedAt field on save
UITemplateSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.UITemplate || mongoose.model<UITemplateType & Document>("UITemplate", UITemplateSchema)


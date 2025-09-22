import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    category: { type: String, trim: true, default: "General" },
    hours: { type: Number, min: 0, default: 0 },
    dueDate: { type: Date, required: true },
    description: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

courseSchema.index({ dueDate: 1 });
export default mongoose.model("Course", courseSchema);

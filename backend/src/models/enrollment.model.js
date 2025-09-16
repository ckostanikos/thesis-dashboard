import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 }, // %
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A user should have at most one enrollment per course
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);

import mongoose from "mongoose";

const kpiSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ["org", "team"], required: true, index: true },
    scopeRef: { type: mongoose.Types.ObjectId, ref: "Team", default: null }, // null for org
    date: { type: Date, required: true, index: true }, // e.g., first day of month
    completionRate: { type: Number, min: 0, max: 100, default: 0 },
    avgScore: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

// Useful for charts/time-series queries
kpiSchema.index({ scope: 1, scopeRef: 1, date: 1 }, { unique: true });

export default mongoose.model("Kpi", kpiSchema);

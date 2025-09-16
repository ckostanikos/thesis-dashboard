import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);

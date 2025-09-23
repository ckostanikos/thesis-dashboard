import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: { type: String, required: true }, // store bcrypt hash
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
      index: true,
    },
    teamId: { type: mongoose.Types.ObjectId, ref: "Team", default: null },
  },
  { timestamps: true }
);

// Hide password in JSON responses
userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.password;
    return ret;
  },
});
userSchema.index({ teamId: 1, role: 1, name: 1 });

export default mongoose.model("User", userSchema);

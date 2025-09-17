import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email }).lean();
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // user.password is hidden by toJSON, but we used .lean() so it’s raw
  const ok = await bcrypt.compare(password, user.password || "");
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role, teamId: user.teamId || null },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  // remove password before sending user info
  const { password: _pw, ...safeUser } = user;
  return res.json({ token, user: safeUser });
}

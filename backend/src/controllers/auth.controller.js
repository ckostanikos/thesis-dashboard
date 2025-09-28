import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password || "");
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  // Put auth info in the session (cookie is set by express-session)
  req.session.userId = String(user._id);
  req.session.role = user.role;
  req.session.teamId = user.teamId ? String(user.teamId) : null;

  // Safe user payload for the UI
  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
  };

  return res.json({ user: safeUser });
}

export async function logout(req, res) {
  req.session?.destroy(() => {
    res.clearCookie("sid");
    res.json({ message: "ok" });
  });
}

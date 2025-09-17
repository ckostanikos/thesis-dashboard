import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export async function listUsers(_req, res) {
  const users = await User.find()
    .select("-password")
    .sort({ role: 1, name: 1 })
    .lean();
  res.json(users);
}

export async function createUser(req, res) {
  const {
    name,
    email,
    password,
    role = "employee",
    teamId = null,
  } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ message: "name, email, password required" });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hash,
    role,
    teamId,
  });
  const { password: _pw, ...safe } = user.toObject();
  res.status(201).json(safe);
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, role, teamId, password } = req.body || {};
  const update = {};
  if (name) update.name = name;
  if (email) update.email = email.toLowerCase();
  if (role) update.role = role; // must be one of enum values
  if (teamId !== undefined) update.teamId = teamId || null;
  if (password) update.password = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(id, update, { new: true })
    .select("-password")
    .lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id).lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted", id });
}

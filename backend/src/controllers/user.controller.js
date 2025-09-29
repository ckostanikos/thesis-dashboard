import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export async function listUsers(req, res, next) {
  try {
    const { role, q, teamId, limit } = req.query;

    const filter = {};
    if (role) {
      // supports role=employee or role=employee,manager
      const ALLOWED = new Set(["employee", "manager", "admin", "sysadmin"]);
      const roles = String(role)
        .split(",")
        .map((r) => r.trim().toLowerCase())
        .filter((r) => ALLOWED.has(r));
      if (roles.length)
        filter.role = roles.length === 1 ? roles[0] : { $in: roles };
    }
    if (teamId) filter.teamId = new mongoose.Types.ObjectId(String(teamId));

    if (q && q.trim()) {
      const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const limitNum = Math.min(Math.max(parseInt(limit || "1000", 10), 1), 1000);

    const users = await User.find(filter)
      .select("_id name email role teamId")
      .sort({ name: 1, email: 1 })
      .limit(limitNum)
      .lean();

    res.json(users);
  } catch (err) {
    next(err);
  }
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
  const exists = await User.findOne({ email: (email || "").toLowerCase() });
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
  if (role) update.role = role;
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

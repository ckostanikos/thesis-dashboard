import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";

async function run() {
  await connectDB();

  // 1) Clear collections (order matters if there are unique indexes)
  await Promise.all([User.deleteMany({}), Team.deleteMany({})]);

  // 2) Teams
  const [teamA, teamB] = await Team.insertMany([
    { name: "Team A" },
    { name: "Team B" },
  ]);

  // 3) Users (your exact names/emails/roles)
  const users = await User.insertMany([
    {
      name: "Christos Kostanikos",
      email: "admin@org.com",
      password: await bcrypt.hash("password", 10),
      role: "admin",
      teamId: null,
    },
    {
      name: "George Georgiou",
      email: "george@org.com",
      password: await bcrypt.hash("password", 10),
      role: "manager",
      teamId: teamA._id, // manager of Team A
    },
    {
      name: "Konstantina Konstantinou",
      email: "konstantina@org.com",
      password: await bcrypt.hash("password", 10),
      role: "employee",
      teamId: teamA._id, // employee in Team A
    },
    {
      name: "Dimitrios Dimitriou",
      email: "dimitrios@org.com",
      password: await bcrypt.hash("password", 10),
      role: "employee",
      teamId: teamB._id, // employee in Team B
    },
    {
      name: "Maria Papadopoulou",
      email: "maria@org.com",
      password: await bcrypt.hash("password", 10),
      role: "employee",
      teamId: teamA._id, // employee in Team A
    },
    {
      name: "Andreas Andreou",
      email: "andreas@org.com",
      password: await bcrypt.hash("password", 10),
      role: "employee",
      teamId: teamB._id, // employee in Team B
    },
    {
      name: "Sofia Sofianou",
      email: "sofia@org.com",
      password: await bcrypt.hash("password", 10),
      role: "employee",
      teamId: teamA._id, // employee in Team A
    },
    {
      name: "Nikos Nikolaou",
      email: "nikos@org.com",
      password: await bcrypt.hash("password", 10),
      role: "employee",
      teamId: teamB._id, // employee in Team B
    },
    {
      name: "Elena Papadopoulou",
      email: "elena@org.com",
      password: await bcrypt.hash("password", 10),
      role: "employee",
      teamId: teamA._id, // employee in Team A
    },
  ]);

  console.log("✅ Seed complete:");
  console.log("  Users:", await User.countDocuments());
  console.log("  Teams:", await Team.countDocuments());

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.disconnect();
});

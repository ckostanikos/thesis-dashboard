// backend/src/seed/seed.js
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import Kpi from "../models/kpi.model.js";

async function run() {
  await connectDB();

  // 1) Clear collections (order matters if there are unique indexes)
  await Promise.all([
    Enrollment.deleteMany({}),
    Kpi.deleteMany({}),
    User.deleteMany({}),
    Team.deleteMany({}),
    Course.deleteMany({}),
  ]);

  // 2) Teams
  const [teamA, teamB] = await Team.insertMany([
    { name: "Team Alpha" },
    { name: "Team Beta" },
  ]);

  // 3) Users (your exact names/emails/roles)
  const users = await User.insertMany([
    {
      name: "System Admin",
      email: "sysadmin@org.com",
      password: await bcrypt.hash("password", 10),
      role: "sysadmin",
      teamId: null,
    },
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
  ]);

  const admin = users.find((u) => u.role === "admin");
  const managerA = users.find((u) => u.email === "george@org.com");
  const empAlpha = users.find((u) => u.email === "konstantina@org.com");
  const empBeta = users.find((u) => u.email === "dimitrios@org.com");

  // 4) Courses
  const courses = await Course.insertMany([
    { title: "React Basics", category: "Web Dev", hours: 5 },
    { title: "MongoDB Intro", category: "Database", hours: 3 },
    { title: "Effective Communication", category: "Soft Skill", hours: 2 },
    { title: "Security Awareness", category: "Compliance", hours: 1 },
    { title: "Node.js Fundamentals", category: "Backend", hours: 4 },
  ]);

  const courseReact = courses.find((c) => c.title === "React Basics");
  const courseMongo = courses.find((c) => c.title === "MongoDB Intro");
  const courseComm = courses.find((c) => c.title === "Effective Communication");
  const courseSec = courses.find((c) => c.title === "Security Awareness");
  const courseNode = courses.find((c) => c.title === "Node.js Fundamentals");

  // 5) Enrollments (progress per user/course)
  await Enrollment.insertMany([
    // Team Alpha employee (Konstantina)
    {
      userId: empAlpha._id,
      courseId: courseReact._id,
      progress: 60,
      completedAt: null,
    },
    {
      userId: empAlpha._id,
      courseId: courseMongo._id,
      progress: 20,
      completedAt: null,
    },
    {
      userId: empAlpha._id,
      courseId: courseComm._id,
      progress: 100,
      completedAt: new Date("2025-08-20"),
    },

    // Team Beta employee (Dimitrios)
    {
      userId: empBeta._id,
      courseId: courseNode._id,
      progress: 40,
      completedAt: null,
    },
    {
      userId: empBeta._id,
      courseId: courseSec._id,
      progress: 100,
      completedAt: new Date("2025-07-15"),
    },

    // Manager (George) also taking some courses
    {
      userId: managerA._id,
      courseId: courseComm._id,
      progress: 80,
      completedAt: null,
    },
  ]);

  // 6) KPIs (org and team-level, monthly series)
  const months = ["2025-06-01", "2025-07-01", "2025-08-01", "2025-09-01"].map(
    (d) => new Date(d)
  );

  // Simple helper to insert a series
  const kpiDocs = [];
  months.forEach((d, i) => {
    // Very basic “trend” numbers just for charts
    kpiDocs.push(
      {
        scope: "org",
        scopeRef: null,
        date: d,
        completionRate: 55 + i * 5,
        avgScore: 7.5 + i * 0.2,
      },
      {
        scope: "team",
        scopeRef: teamA._id,
        date: d,
        completionRate: 60 + i * 4,
        avgScore: 7.8 + i * 0.1,
      },
      {
        scope: "team",
        scopeRef: teamB._id,
        date: d,
        completionRate: 50 + i * 6,
        avgScore: 7.2 + i * 0.25,
      }
    );
  });
  await Kpi.insertMany(kpiDocs);

  console.log("✅ Seed complete:");
  console.log("  Users:", await User.countDocuments());
  console.log("  Teams:", await Team.countDocuments());
  console.log("  Courses:", await Course.countDocuments());
  console.log("  Enrollments:", await Enrollment.countDocuments());
  console.log("  KPIs:", await Kpi.countDocuments());

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.disconnect();
});

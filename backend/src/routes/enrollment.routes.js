import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  assignCourse,
  getEnrollmentsByUser,
  enrollSelf,
  checkEnrollmentStatus,
  markCompleted,
} from "../controllers/enrollment.controller.js";

const r = Router();

// Only managers and admins can assign (employees cannot)
r.post("/assign", requireAuth, requireRole("manager", "admin"), assignCourse);

r.get("/by-user/:id", requireAuth, getEnrollmentsByUser);

// Employees & Managers can self-enroll
r.post("/self", requireAuth, enrollSelf);

//Check which of the provided users are already enrolled in a course

r.post(
  "/check-status",
  requireAuth,
  requireRole("manager", "admin"),
  checkEnrollmentStatus
);

//any authenticated user can mark THEIR OWN completion
r.patch("/mark-completed", requireAuth, markCompleted);

export default r;

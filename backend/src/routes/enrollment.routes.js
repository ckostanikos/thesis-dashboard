import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  assignCourse,
  getEnrollmentsByUser,
  enrollSelf,
} from "../controllers/enrollment.controller.js";

const r = Router();

// Only managers and admins can assign (employees cannot)
r.post("/assign", requireAuth, requireRole("manager", "admin"), assignCourse);

r.get("/by-user/:id", requireAuth, getEnrollmentsByUser);

// Employees & Managers can self-enroll
r.post("/self", requireAuth, enrollSelf);

export default r;

import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { assignCourse } from "../controllers/enrollment.controller.js";

const r = Router();

// Only managers, admins, sysadmins can assign (employees cannot)
r.post(
  "/assign",
  requireAuth,
  requireRole("manager", "admin", "sysadmin"),
  assignCourse
);

export default r;

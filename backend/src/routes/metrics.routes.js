import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  teamOverview,
  teamEnrollmentsByCourse,
  teamCompletionRateByCourse,
  teamOverdueByCourse,
  teamUserPerformance,
} from "../controllers/metrics.controller.js";

const r = Router();

r.get(
  "/team/:teamId/overview",
  requireAuth,
  requireRole("manager", "admin"),
  teamOverview
);
r.get(
  "/team/:teamId/enrollments-by-course",
  requireAuth,
  requireRole("manager", "admin"),
  teamEnrollmentsByCourse
);
r.get(
  "/team/:teamId/completion-rate-by-course",
  requireAuth,
  requireRole("manager", "admin"),
  teamCompletionRateByCourse
);
r.get(
  "/team/:teamId/overdue-by-course",
  requireAuth,
  requireRole("manager", "admin"),
  teamOverdueByCourse
);
r.get(
  "/team/:teamId/performance",
  requireAuth,
  requireRole("manager", "admin"),
  teamUserPerformance
);

export default r;

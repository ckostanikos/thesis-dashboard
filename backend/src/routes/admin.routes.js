import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import {
  overview,
  enrollmentsByCourse,
  completionRateByCourse,
  teamPerformance,
  overdueByCourse,
} from "../controllers/metrics.controller.js";

const r = Router();
r.use(requireAuth, requireRole("admin")); // all routes below require admin

r.get("/users", listUsers); // list all users
r.post("/users", createUser); // create (hashes password)
r.patch("/users/:id", updateUser); // update name/email/role/teamId/password
r.delete("/users/:id", deleteUser);

// metrics
r.get("/metrics/overview", overview);
r.get("/metrics/enrollments-by-course", enrollmentsByCourse);
r.get("/metrics/completion-rate-by-course", completionRateByCourse);
r.get("/metrics/team-performance", teamPerformance);
r.get("/metrics/overdue-by-course", overdueByCourse);

export default r;

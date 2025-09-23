import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { listTeams, listTeamMembers } from "../controllers/team.controller.js";

const r = Router();

// Anyone authenticated can list teams (adjust if you want stricter)
r.get("/", requireAuth, listTeams);

// Admins can access any team; managers only their own (extra check in controller)
r.get(
  "/:id/members",
  requireAuth,
  requireRole("manager", "admin"),
  listTeamMembers
);

export default r;

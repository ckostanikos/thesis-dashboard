import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole, requireManagerOfTeam } from "../middleware/roles.js";
import { getOrgKpis, getTeamKpis } from "../controllers/kpi.controller.js";

const r = Router();

// GET /api/kpis/org  (protected)
r.get("/org", requireAuth, requireRole("sysadmin", "admin"), getOrgKpis);
r.get("/team/:id", requireAuth, requireManagerOfTeam(), getTeamKpis);

export default r;

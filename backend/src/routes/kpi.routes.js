import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { getOrgKpis, getTeamKpis } from "../controllers/kpi.controller.js";

const r = Router();

// GET /api/kpis/org  (protected)
r.get("/org", requireAuth, getOrgKpis);
r.get("/team/:id", requireAuth, getTeamKpis);

export default r;

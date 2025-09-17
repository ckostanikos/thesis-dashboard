import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { getOrgKpis } from "../controllers/kpi.controller.js";

const r = Router();

// GET /api/kpis/org  (protected)
r.get("/org", requireAuth, getOrgKpis);

export default r;

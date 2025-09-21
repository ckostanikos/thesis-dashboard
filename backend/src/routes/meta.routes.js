import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { getRoles } from "../controllers/meta.controller.js";

const r = Router();

// Only admin needs this for user-management UI.
r.get("/roles", requireAuth, requireRole("admin"), getRoles);

export default r;

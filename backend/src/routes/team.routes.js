import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { listTeams } from "../controllers/team.controller.js";

const r = Router();
r.get("/", requireAuth, listTeams);
export default r;

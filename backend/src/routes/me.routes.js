import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { getMe } from "../controllers/me.controller.js";

const r = Router();

r.get("/", requireAuth, getMe);

export default r;

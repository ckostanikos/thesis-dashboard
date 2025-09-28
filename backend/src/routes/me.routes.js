import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { getMe, changePassword } from "../controllers/me.controller.js";

const r = Router();

r.get("/", requireAuth, getMe);

//change password for the logged-in user
r.patch("/password", requireAuth, changePassword);

export default r;

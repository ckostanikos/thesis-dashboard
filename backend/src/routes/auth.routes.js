import { Router } from "express";
import { login, logout } from "../controllers/auth.controller.js";

const r = Router();

r.post("/login", login);
r.post("/logout", logout);

export default r;

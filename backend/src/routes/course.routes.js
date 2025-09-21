import { Router } from "express";
import requireAuth from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { listCourses, createCourse } from "../controllers/course.controller.js";

const r = Router();

// anyone logged in can list courses (adjust if you want)
r.get("/", requireAuth, listCourses);

// admin only can create courses
r.post("/", requireAuth, requireRole("admin"), createCourse);

export default r;

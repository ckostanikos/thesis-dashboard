import Course from "../models/course.model.js";

export async function listCourses(_req, res) {
  const courses = await Course.find().sort({ title: 1 }).lean();
  res.json(courses);
}

export async function createCourse(req, res) {
  const { title, category = "General", hours = 0 } = req.body || {};
  if (!title) return res.status(400).json({ message: "title is required" });
  const course = await Course.create({ title, category, hours });
  res.status(201).json(course);
}

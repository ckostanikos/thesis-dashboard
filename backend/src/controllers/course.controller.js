import Course from "../models/course.model.js";

export async function listCourses(_req, res) {
  const courses = await Course.find().sort({ title: 1 }).lean();
  res.json(courses);
}

export async function createCourse(req, res) {
  const { title, category = "General", hours = 0, dueDate } = req.body || {};
  if (!title) return res.status(400).json({ message: "title is required" });
  // If the caller doesn’t provide a dueDate, default to +30 days from now
  const DEFAULT_DUE_DAYS = 30;
  let finalDueDate = dueDate ? new Date(dueDate) : null;
  if (!finalDueDate || Number.isNaN(finalDueDate.getTime())) {
    finalDueDate = new Date(
      Date.now() + DEFAULT_DUE_DAYS * 24 * 60 * 60 * 1000
    );
  }

  const course = await Course.create({
    title,
    category,
    hours,
    dueDate: finalDueDate,
  });
  res.status(201).json(course);
}

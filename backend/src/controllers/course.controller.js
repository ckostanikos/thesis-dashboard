import Course from "../models/course.model.js";

export async function listCourses(_req, res) {
  const courses = await Course.find().sort({ title: 1 }).lean();
  res.json(courses);
}

export async function createCourse(req, res) {
  const {
    title,
    category = "General",
    hours = 0,
    dueDate,
    imageUrl = "",
    description,
  } = req.body || {};
  if (!title) return res.status(400).json({ message: "title is required" });
  // If the caller doesn’t provide a dueDate, default to +30 days from now
  const DEFAULT_DUE_DAYS = 30;
  let finalDueDate = dueDate ? new Date(dueDate) : null;
  if (!finalDueDate || Number.isNaN(finalDueDate.getTime())) {
    finalDueDate = new Date(
      Date.now() + DEFAULT_DUE_DAYS * 24 * 60 * 60 * 1000
    );
  }

  // Validates Data URL size <= 1MB
  if (
    imageUrl &&
    typeof imageUrl === "string" &&
    imageUrl.startsWith("data:image/")
  ) {
    const b64 = imageUrl.split(",")[1] || "";
    const padding = (b64.match(/=+$/) || [""])[0].length;
    const bytes = (b64.length * 3) / 4 - padding;
    if (bytes > 1 * 1024 * 1024) {
      return res.status(413).json({ message: "Thumbnail exceeds 1 MB" });
    }
  }

  const course = await Course.create({
    title,
    category,
    hours,
    dueDate: finalDueDate,
    imageUrl,
    description,
  });
  res.status(201).json(course);
}

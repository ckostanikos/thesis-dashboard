import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

export async function listCourses(req, res, next) {
  try {
    const { stats } = req.query || {};
    const wantStats = String(stats) === "1" || String(stats) === "true";

    if (!wantStats) {
      const courses = await Course.find().sort({ title: 1 }).lean();
      return res.json(courses);
    }

    // Simpler, robust pipeline: join and $size the array
    const courses = await Course.aggregate([
      { $sort: { title: 1 } },
      {
        $lookup: {
          from: "enrollments", // Mongoose collection name for Enrollment
          localField: "_id",
          foreignField: "courseId",
          as: "_enrs",
        },
      },
      { $addFields: { enrollmentsCount: { $size: "$_enrs" } } },
      { $project: { _enrs: 0 } },
    ]);
    return res.json(courses);
  } catch (err) {
    next(err);
  }
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

export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id).lean();
    if (!course) return res.status(404).json({ message: "Course not found" });

    const { deletedCount } = await Enrollment.deleteMany({ courseId: id });
    res.json({
      message: "Course deleted",
      courseId: id,
      removedEnrollments: deletedCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkDeleteCourses(req, res, next) {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids[] is required" });
    }

    // delete courses
    const delCourses = await Course.deleteMany({ _id: { $in: ids } });
    // delete related enrollments
    const delEnrollments = await Enrollment.deleteMany({
      courseId: { $in: ids },
    });

    res.json({
      message: "Bulk delete completed",
      requested: ids.length,
      deletedCourses: delCourses.deletedCount || 0,
      removedEnrollments: delEnrollments.deletedCount || 0,
    });
  } catch (err) {
    next(err);
  }
}

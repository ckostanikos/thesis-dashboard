import User from "../models/user.model.js";
import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";

export async function getMe(req, res) {
  try {
    const userId = req.user.id;

    // 1) Get user info
    const user = await User.findById(userId).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2) Get enrollments for this user
    const enrollments = await Enrollment.find({ userId }).lean();

    // 3) Attach course details
    const courseIds = enrollments.map((e) => e.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    const enrollmentsWithCourse = enrollments.map((e) => {
      const course = courses.find(
        (c) => c._id.toString() === e.courseId.toString()
      );
      return { ...e, course };
    });

    res.json({ user, enrollments: enrollmentsWithCourse });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
}

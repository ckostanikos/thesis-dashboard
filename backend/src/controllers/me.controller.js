import User from "../models/user.model.js";
import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";
import bcrypt from "bcryptjs";

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
    const courses = await Course.find({ _id: { $in: courseIds } })
      .select("title category hours imageUrl dueDate")
      .lean();

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
//change password for the logged-in user
export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }
    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update password" });
  }
}

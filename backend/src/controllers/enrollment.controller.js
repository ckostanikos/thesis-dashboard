import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";

// Helper to check manager can touch target user
function canManageUser(actor, targetUser) {
  if (actor.role === "sysadmin" || actor.role === "admin") return true;
  if (actor.role !== "manager") return false;
  if (!actor.teamId) return false;
  return String(actor.teamId) === String(targetUser.teamId);
}

/**
 * Assigns (or reassigns) a course to a user.
 * If an enrollment already exists, doesn't duplicate; it keeps it (progress stays as-is unless it want to reset).
 */
export async function assignCourse(req, res) {
  const { userId, courseId } = req.body || {};
  if (!userId || !courseId) {
    return res
      .status(400)
      .json({ message: "userId and courseId are required" });
  }

  // Validates target user & course
  const [targetUser, course] = await Promise.all([
    User.findById(userId).lean(),
    Course.findById(courseId).lean(),
  ]);
  if (!targetUser)
    return res.status(404).json({ message: "Target user not found" });
  if (!course) return res.status(404).json({ message: "Course not found" });

  // Only allows assigning to employees
  if (targetUser.role !== "employee") {
    return res
      .status(400)
      .json({ message: "Only employees can be assigned courses" });
  }

  // RBAC: sysadmin/admin unrestricted; manager restricted to own team
  if (!canManageUser(req.user, targetUser)) {
    return res
      .status(403)
      .json({ message: "Forbidden: cannot assign to this user" });
  }

  // 🔒 Duplicate prevention (API-level)
  const existing = await Enrollment.findOne({ userId, courseId }).lean();
  if (existing) {
    return res.status(409).json({
      message: "Enrollment already exists for this user and course",
      enrollment: existing,
    });
  }

  try {
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      progress: 0,
      completedAt: null,
    });
    return res.status(201).json({ message: "Assigned", enrollment });
  } catch (err) {
    // 🔒 Safety-net for race conditions (DB-level unique index)
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Enrollment already exists (duplicate)",
      });
    }
    throw err;
  }
}

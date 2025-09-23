import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";

// Helper to check manager can touch target user
function canManageUser(actor, targetUser) {
  if (actor.role === "admin") return true;
  if (actor.role !== "manager") return false;
  if (!actor.teamId) return false;
  return String(actor.teamId) === String(targetUser.teamId);
}

/**
 GET /api/enrollments/by-user/:id
 - admin: can view any user
 - manager: can view users in their team
 - employee: can only view themselves
 */
export async function getEnrollmentsByUser(req, res) {
  const targetUserId = req.params.id;

  // Fetch target user (to perform RBAC checks)
  const targetUser = await User.findById(targetUserId).lean();
  if (!targetUser) return res.status(404).json({ message: "User not found" });

  // RBAC
  const actor = req.user;
  const sameUser = String(actor.id) === String(targetUserId);

  const actorIsEmployee = actor.role === "employee";
  if (actorIsEmployee && !sameUser) {
    return res
      .status(403)
      .json({ message: "Employees can only view their own enrollments" });
  }

  if (!sameUser && !canManageUser(actor, targetUser)) {
    return res
      .status(403)
      .json({ message: "Forbidden: cannot view this user's enrollments" });
  }

  // Query enrollments + join course details
  const enrollments = await Enrollment.find({ userId: targetUserId }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();

  const data = enrollments.map((e) => ({
    ...e,
    course: courses.find((c) => String(c._id) === String(e.courseId)) || null,
  }));

  res.json({
    user: {
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      teamId: targetUser.teamId,
    },
    enrollments: data,
  });
}

/**
 Assigns (or reassigns) a course to a user.
 If an enrollment already exists, doesn't duplicate; it keeps it (progress stays as-is unless it want to reset).
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

  // RBAC: admin unrestricted; manager restricted to own team
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

export async function enrollSelf(req, res) {
  const actor = req.user; // { id, role, teamId, ... }
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  // employees and managers can self-enroll
  if (!["employee", "manager"].includes(actor.role)) {
    return res
      .status(403)
      .json({ message: "Only employees or managers can self-enroll" });
  }

  const { courseId } = req.body || {};
  if (!courseId)
    return res.status(400).json({ message: "courseId is required" });

  const course = await Course.findById(courseId).lean();
  if (!course) return res.status(404).json({ message: "Course not found" });

  // no duplicates
  const existing = await Enrollment.findOne({
    userId: actor.id,
    courseId,
  }).lean();
  if (existing) {
    return res
      .status(409)
      .json({ message: "Already enrolled", enrollment: existing });
  }

  try {
    const enrollment = await Enrollment.create({
      userId: actor.id,
      courseId,
      progress: 0,
      completedAt: null,
    });
    return res.status(201).json({ message: "Enrolled", enrollment });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Already enrolled (duplicate)" });
    }
    throw err;
  }
}

export async function checkEnrollmentStatus(req, res, next) {
  try {
    const actor = req.user; // { id, role, teamId }
    if (!actor) return res.status(401).json({ message: "Unauthorized" });

    const { courseId, userIds } = req.body || {};
    if (!courseId || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "courseId and userIds[] are required" });
    }

    // Determine which userIds the actor is allowed to query
    let allowedIds = userIds.map(String);

    if (actor.role === "manager") {
      if (!actor.teamId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const teamEmployees = await User.find({
        teamId: actor.teamId,
        role: "employee",
        _id: { $in: allowedIds },
      })
        .select("_id")
        .lean();
      allowedIds = teamEmployees.map((u) => String(u._id));
    } else if (actor.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Find enrollments for the course among allowed users
    const rows = await Enrollment.find({
      courseId,
      userId: { $in: allowedIds },
    })
      .select("userId")
      .lean();

    const enrolledUserIds = rows.map((r) => String(r.userId));
    res.json({ enrolledUserIds, checkedCount: allowedIds.length });
  } catch (err) {
    next(err);
  }
}

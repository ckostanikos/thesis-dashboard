import api from "./client";

// self-enroll (employee/manager)
export async function enrollSelf(courseId) {
  const { data } = await api.post("/api/enrollments/self", { courseId });
  return data; // { message, enrollment }
}

export async function assignCourse(userId, courseId) {
  const { data } = await api.post("/api/enrollments/assign", {
    userId,
    courseId,
  });
  return data;
}

export async function checkEnrollmentStatus(courseId, userIds) {
  const { data } = await api.post("/api/enrollments/check-status", {
    courseId,
    userIds,
  });
  return data; // { enrolledUserIds: [...], checkedCount: n }
}

export async function fetchEnrollmentsByUser(userId) {
  const { data } = await api.get(`/api/enrollments/by-user/${userId}`);
  return data; // { user, enrollments: [...] }
}

export async function markCompleted(courseId, completed) {
  const { data } = await api.patch("/api/enrollments/mark-completed", {
    courseId,
    completed,
  });
  return data;
}

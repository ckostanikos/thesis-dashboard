import api, { ensureCsrf } from "./client";

// self-enroll (employee/manager)
export async function enrollSelf(courseId) {
  await ensureCsrf();
  const { data } = await api.post("/api/enrollments/self", { courseId });
  return data; // { message, enrollment }
}

export async function assignCourse(userId, courseId) {
  await ensureCsrf();
  const { data } = await api.post("/api/enrollments/assign", {
    userId,
    courseId,
  });
  return data;
}

export async function checkEnrollmentStatus(courseId, userIds) {
  await ensureCsrf();
  const { data } = await api.post("/api/enrollments/check-status", {
    courseId,
    userIds,
  });
  return data; // { enrolledUserIds: [...], checkedCount: n }
}

export async function fetchEnrollmentsByUser(userId) {
  await ensureCsrf();
  const { data } = await api.get(`/api/enrollments/by-user/${userId}`);
  return data; // { user, enrollments: [...] }
}

export async function markCompleted(courseId, completed) {
  await ensureCsrf();
  const { data } = await api.patch("/api/enrollments/mark-completed", {
    courseId,
    completed,
  });
  return data;
}

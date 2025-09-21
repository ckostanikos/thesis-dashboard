import api from "./client";

// self-enroll (employee/manager)
export async function enrollSelf(courseId) {
  const { data } = await api.post("/api/enrollments/self", { courseId });
  return data; // { message, enrollment }
}

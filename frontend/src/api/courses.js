import api from "./client";

export async function fetchCourses() {
  const { data } = await api.get("/api/courses");
  return data; // [{ _id, title, category, hours, imageUrl?, dueDate }]
}

export async function createCourse(payload) {
  // payload: { title, category, hours, dueDate, description?, imageUrl? }
  const { data } = await api.post("/api/courses", payload);
  return data;
}

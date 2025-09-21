import api from "./client";

export async function fetchCourses() {
  const { data } = await api.get("/api/courses");
  return data; // [{ _id, title, category, hours, imageUrl?, dueDate }]
}

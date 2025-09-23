import api from "./client";

export async function fetchCourses(opts = {}) {
  const params = {};
  if (opts.stats) params.stats = 1;
  const { data } = await api.get("/api/courses", { params });
  return data; // [{ _id, title, category, hours, imageUrl?, dueDate }]
}

export async function createCourse(payload) {
  // payload: { title, category, hours, dueDate, description?, imageUrl? }
  const { data } = await api.post("/api/courses", payload);
  return data;
}

export async function deleteCourseById(id) {
  const { data } = await api.delete(`/api/courses/${id}`);
  return data;
}

export async function bulkDeleteCourses(ids) {
  const { data } = await api.post("/api/courses/bulk-delete", { ids });
  return data;
}

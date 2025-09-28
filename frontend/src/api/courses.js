import api, { ensureCsrf } from "./client";

export async function fetchCourses(opts = {}) {
  const params = {};
  if (opts.stats) params.stats = 1;
  const { data } = await api.get("/api/courses", { params });
  return data; // [{ _id, title, category, hours, imageUrl?, dueDate }]
}

export async function createCourse(payload) {
  await ensureCsrf();
  const { data } = await api.post("/api/courses", payload);
  return data;
}

export async function deleteCourseById(id) {
  await ensureCsrf();
  const { data } = await api.delete(`/api/courses/${id}`);
  return data;
}

export async function bulkDeleteCourses(ids) {
  await ensureCsrf();
  const { data } = await api.post("/api/courses/bulk-delete", { ids });
  return data;
}

export async function fetchCourse(id) {
  const { data } = await api.get(`/api/courses/${id}`);
  return data;
}

export async function updateCourse(id, payload) {
  await ensureCsrf();
  const { data } = await api.patch(`/api/courses/${id}`, payload);
  return data;
}

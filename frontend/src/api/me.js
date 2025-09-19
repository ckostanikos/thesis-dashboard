import api from "./client";

export async function fetchMe() {
  const { data } = await api.get("/api/me");
  return data; // { user, enrollments: [...] }
}

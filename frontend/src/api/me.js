import api from "./client";

export async function fetchMe() {
  const { data } = await api.get("/api/me");
  return data; // { user, enrollments: [...] }
}
export async function changeMyPassword(currentPassword, newPassword) {
  const { data } = await api.patch("/api/me/password", {
    currentPassword,
    newPassword,
  });
  return data; // { message }
}

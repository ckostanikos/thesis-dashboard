import api, { ensureCsrf, clearCsrf } from "./client";

export async function login(email, password) {
  await ensureCsrf();
  const { data } = await api.post("/api/auth/login", { email, password });
  return data; // { user }
}

export async function logout() {
  await api.post("/api/auth/logout");
  clearCsrf(); // Clear the cached CSRF token
}

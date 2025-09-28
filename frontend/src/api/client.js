import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true, //  send/receive the session cookie
});

// ensures the CSRF token is set
let csrfToken = "";
export async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const { data } = await api.get("/api/csrf");
  csrfToken = data.csrfToken;
  api.defaults.headers.common["X-CSRF-Token"] = csrfToken;
  return csrfToken;
}

// Clear the cached CSRF token (call this on logout)
export function clearCsrf() {
  csrfToken = "";
  delete api.defaults.headers.common["X-CSRF-Token"];
}

export default api;

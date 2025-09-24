import api from "./client";

// Admin: get all employees
export async function fetchEmployeesAdmin() {
  // Adjust path if your admin route differs
  const { data } = await api.get("/api/admin/users?role=employee");
  return data; // [{ _id, name, email, role, teamId }]
}

// Manager: get own team members
export async function fetchTeamMembers(teamId) {
  const { data } = await api.get(`/api/teams/${teamId}/members`);
  return data; // [{ _id, name, email, role }]
}

// Admin: list users (supports q, role, teamId)
export async function fetchUsersAdmin({ q = "", role = "", teamId = "" } = {}) {
  const params = {};
  if (q) params.q = q;
  if (role) params.role = role;
  if (teamId) params.teamId = teamId;
  const { data } = await api.get("/api/admin/users", { params });
  return data; // [{ _id, name, email, role, teamId }]
}

// Admin: update user
export async function updateUserAdmin(id, payload) {
  const { data } = await api.patch(`/api/admin/users/${id}`, payload);
  return data;
}

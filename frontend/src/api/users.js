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

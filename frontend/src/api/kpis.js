import api from "./client";

export async function fetchOrgKpis() {
  const { data } = await api.get("/api/kpis/org");
  return data;
}

export async function fetchTeamKpis(teamId) {
  const { data } = await api.get(`/api/kpis/team/${teamId}`);
  return data;
}

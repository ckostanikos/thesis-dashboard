import api from "./client";

export async function fetchTeams() {
  const { data } = await api.get("/api/teams");
  return data;
}

import api from "./client";

// Admin (company-wide)
export const getOverview = () =>
  api.get("/api/admin/metrics/overview").then((r) => r.data);

export const getEnrollmentsByCourse = () =>
  api.get("/api/admin/metrics/enrollments-by-course").then((r) => r.data);

export const getCompletionRateByCourse = () =>
  api.get("/api/admin/metrics/completion-rate-by-course").then((r) => r.data);

export const getTeamPerformance = () =>
  api.get("/api/admin/metrics/team-performance").then((r) => r.data);

export const getOverdueByCourse = () =>
  api.get("/api/admin/metrics/overdue-by-course").then((r) => r.data);

//Team-scoped (manager)

export const getTeamOverview = (teamId) =>
  api.get(`/api/metrics/team/${teamId}/overview`).then((r) => r.data);

export const getTeamEnrollments = (teamId) =>
  api
    .get(`/api/metrics/team/${teamId}/enrollments-by-course`)
    .then((r) => r.data);

export const getTeamCompletionRate = (teamId) =>
  api
    .get(`/api/metrics/team/${teamId}/completion-rate-by-course`)
    .then((r) => r.data);

export const getTeamOverdue = (teamId) =>
  api.get(`/api/metrics/team/${teamId}/overdue-by-course`).then((r) => r.data);

export const getTeamUserPerformance = (teamId) =>
  api.get(`/api/metrics/team/${teamId}/performance`).then((r) => r.data);

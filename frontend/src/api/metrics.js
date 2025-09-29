import api from "./client";

export const getOverview = async () =>
  (await api.get("/api/admin/metrics/overview")).data;

export const getEnrollmentsByCourse = async () =>
  (await api.get("/api/admin/metrics/enrollments-by-course")).data;

export const getCompletionRateByCourse = async () =>
  (await api.get("/api/admin/metrics/completion-rate-by-course")).data;

export const getTeamPerformance = async () =>
  (await api.get("/api/admin/metrics/team-performance")).data;

export const getOverdueByCourse = async () =>
  (await api.get("/api/admin/metrics/overdue-by-course")).data;

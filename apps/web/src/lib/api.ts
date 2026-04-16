/**
 * Typed API client using axios with JWT interceptors.
 */
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = res.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ── Chat ──────────────────────────────────────────────────
export const chatAPI = {
  getSessions: () => api.get("/chat/sessions"),
  createSession: (title?: string) => api.post("/chat/sessions", { title }),
  deleteSession: (id: number) => api.delete(`/chat/sessions/${id}`),
  getMessages: (sessionId: number) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (message: string, session_id?: number) =>
    api.post("/chat/", { message, session_id }),
};

// ── Reports ───────────────────────────────────────────────
export const reportsAPI = {
  generate: (data: { description: string; location?: string; municipality?: string }) =>
    api.post("/reports/generate", data),
  list: () => api.get("/reports/"),
  get: (id: number) => api.get(`/reports/${id}`),
};

// ── Users ─────────────────────────────────────────────────
export const usersAPI = {
  myVerifications: () => api.get("/users/me/verifications"),
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get("/admin/stats"),
  users: () => api.get("/admin/users"),
  auditLogs: () => api.get("/admin/audit-logs"),
  deactivateUser: (id: number) => api.patch(`/admin/users/${id}/deactivate`),
};

// ── Datasets ──────────────────────────────────────────────
export const datasetsAPI = {
  list: () => api.get("/datasets/"),
  upload: (formData: FormData) =>
    api.post("/datasets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: number) => api.delete(`/datasets/${id}`),
};

import { apiClient } from "./axiosClient";

// AuthController
// Returns only token, frontend decodes jwt for info

export function register({ name, email, password }) {
  return apiClient.post("/api/auth/register", { name, email, password }).then((r) => r.data);
}

export function login({ email, password }) {
  return apiClient.post("/api/auth/login", { email, password }).then((r) => r.data);
}

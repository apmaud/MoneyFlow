import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/authSlice";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5080";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token if in redux store, to every req
apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if token bad, clear local auth state, and app route guards redirect to login page
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

// Error message handling to something simple.
export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  return data.message || data.title || data.detail || fallback;
}

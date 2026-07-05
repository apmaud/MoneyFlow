import { apiClient } from "./axiosClient";

// Requires bearer token
// AccountsController

export function fetchAccounts() {
  return apiClient.get("/api/accounts").then((r) => r.data);
}

export function fetchAccountById(id) {
  return apiClient.get(`/api/accounts/${id}`).then((r) => r.data);
}

export function createAccount({ openingBalance }) {
  return apiClient.post("/api/accounts", { openingBalance }).then((r) => r.data);
}

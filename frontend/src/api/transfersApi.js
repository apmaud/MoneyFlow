import { apiClient } from "./axiosClient";

// TransfersController

export function placeTransfer({ fromAccountId, toAccountNumber, amount, idempotencyKey }) {
  return apiClient
    .post("/api/transfers", { fromAccountId, toAccountNumber, amount, idempotencyKey })
    .then((r) => r.data);
}

export function fetchTransferById(id) {
  return apiClient.get(`/api/transfers/${id}`).then((r) => r.data);
}

// History for a single account — used by the per-account details dialog.
export function fetchAccountTransferHistory(accountId, page = 1, pageSize = 20) {
  return apiClient
    .get(`/api/transfers/account/${accountId}`, { params: { page, pageSize } })
    .then((r) => r.data);
}

// History across every account the current user owns — used by the
// Accounts tab's "Transfer history" section.
export function fetchAllTransferHistory(page = 1, pageSize = 20) {
  return apiClient.get("/api/transfers/history", { params: { page, pageSize } }).then((r) => r.data);
}

export function generateIdempotencyKey() {
  return crypto.randomUUID();
}

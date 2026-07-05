import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as transfersApi from "../api/transfersApi";
import { extractErrorMessage } from "../api/axiosClient";
import { fetchAccounts } from "./accountsSlice";
import { logout } from "./authSlice";

const HISTORY_PAGE_SIZE = 20;

// Cached, session-scoped history across every account the user owns.
// Same idle-check caching pattern as accountsSlice — the Accounts tab only
// fetches this once, then again after any transfer that might change it.
export const fetchTransferHistory = createAsyncThunk(
  "transfers/fetchHistory",
  async ({ page = 1, pageSize = HISTORY_PAGE_SIZE } = {}, { rejectWithValue }) => {
    try {
      return await transfersApi.fetchAllTransferHistory(page, pageSize);
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Could not load transfer history."));
    }
  }
);

export const placeTransfer = createAsyncThunk(
  "transfers/place",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const idempotencyKey = payload.idempotencyKey || transfersApi.generateIdempotencyKey();
      const transfer = await transfersApi.placeTransfer({ ...payload, idempotencyKey });
      // Balances on both sides may have changed (or the transfer may be
      // pending review) — refresh both the cached account list and the
      // cached transfer history so the Accounts tab reflects reality
      // without the user manually reloading.
      await Promise.all([dispatch(fetchAccounts()), dispatch(fetchTransferHistory())]);
      return transfer;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "The transfer could not be completed."));
    }
  }
);

const initialState = {
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  lastResult: null,
  history: [],
  historyStatus: "idle", // idle | loading | succeeded | failed
  historyError: null,
  historyPage: 1,
  historyHasMore: true,
};

const transfersSlice = createSlice({
  name: "transfers",
  initialState,
  reducers: {
    resetTransferStatus(state) {
      state.status = "idle";
      state.error = null;
      state.lastResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeTransfer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(placeTransfer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastResult = action.payload;
      })
      .addCase(placeTransfer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchTransferHistory.pending, (state) => {
        state.historyStatus = "loading";
        state.historyError = null;
      })
      .addCase(fetchTransferHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";

        const requestedPage = action.meta.arg?.page ?? 1;
        const pageSize = action.meta.arg?.pageSize ?? HISTORY_PAGE_SIZE;

        // Page 1 (a fresh load, or the explicit refresh button) replaces the
        // list outright. Anything after that is a "Load more" click, which
        // appends instead — otherwise going back to page 1 on refresh would
        // wipe out everything the user had already loaded further down.
        state.history = requestedPage === 1 ? action.payload : [...state.history, ...action.payload];
        state.historyPage = requestedPage;

        // No total-count endpoint on the backend, so this is the standard
        // heuristic instead: a page shorter than the requested size means
        // there's nothing left after it.
        state.historyHasMore = action.payload.length === pageSize;
      })
      .addCase(fetchTransferHistory.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.historyError = action.payload;
      })
      // Same reasoning as accountsSlice — resets regardless of which code
      // path triggered the logout, closing the interceptor's auto-logout
      // path too, not just the profile page's button.
      .addCase(logout, () => initialState);
  },
});

export const { resetTransferStatus } = transfersSlice.actions;
export const selectTransferHistory = (state) => state.transfers.history;
export const selectTransferHistoryStatus = (state) => state.transfers.historyStatus;
export const selectTransferHistoryHasMore = (state) => state.transfers.historyHasMore;
export const selectTransferHistoryPage = (state) => state.transfers.historyPage;
export default transfersSlice.reducer;

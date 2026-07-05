import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as accountsApi from "../api/accountsApi";
import { extractErrorMessage } from "../api/axiosClient";
import { logout } from "./authSlice";

// Accounts are cached in Redux after the first fetch. Components should
// call ensureAccountsLoaded() (below) instead of fetchAccounts() directly —
// it only hits the backend if we don't already have data, or if a caller
// explicitly forces a refresh (e.g. after a transfer or new account).
export const fetchAccounts = createAsyncThunk("accounts/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await accountsApi.fetchAccounts();
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, "Could not load your accounts."));
  }
});

export const createAccount = createAsyncThunk(
  "accounts/create",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const account = await accountsApi.createAccount(payload);
      // Re-fetch the full list so totals stay consistent with the backend,
      // rather than guessing how to splice the new account in locally.
      await dispatch(fetchAccounts());
      return account;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, "Could not create the account."));
    }
  }
);

const initialState = {
  items: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  createStatus: "idle",
  createError: null,
  lastFetchedAt: null,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    resetCreateStatus(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createAccount.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createAccount.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })
      // Fires on ANY logout — whether from the profile page's button or the
      // axios interceptor auto-logging someone out on a 401 — so a new
      // user's session can never inherit a previous user's cached accounts.
      .addCase(logout, () => initialState);
  },
});

export const { resetCreateStatus } = accountsSlice.actions;

export const selectAccounts = (state) => state.accounts.items;
export const selectAccountsStatus = (state) => state.accounts.status;
export const selectTotalBalance = (state) =>
  state.accounts.items.reduce((sum, a) => sum + a.balance, 0);

export default accountsSlice.reducer;

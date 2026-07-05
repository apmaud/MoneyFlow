import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import * as authApi from "../api/authApi";
import { extractErrorMessage } from "../api/axiosClient";

// The backend only ever returns { token } — it never sends a separate user
// object (see AuthResponse). So the frontend decodes the JWT's claims
// itself: NameIdentifier (id), Email, and Name were the three claims
// JwtTokenService embedded at issuance.
function userFromToken(token) {
  const claims = jwtDecode(token);
  return {
    id: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || claims.nameid || claims.sub,
    email: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || claims.email,
    name: claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || claims.name || claims.unique_name,
    exp: claims.exp,
  };
}

function isExpired(user) {
  if (!user?.exp) return false;
  return Date.now() >= user.exp * 1000;
}

export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { token } = await authApi.register(payload);
    return token;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, "Could not create your account."));
  }
});

export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { token } = await authApi.login(payload);
    return token;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, "Incorrect email or password."));
  }
});

const initialState = {
  token: null,
  user: null,
  status: "idle", // idle | loading | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    // Called once on app boot to catch a token that expired while the
    // browser tab was closed, before any API call would otherwise reveal it.
    checkSessionExpiry(state) {
      if (state.token && isExpired(state.user)) {
        state.token = null;
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload;
        state.user = userFromToken(action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.token = action.payload;
        state.user = userFromToken(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, checkSessionExpiry } = authSlice.actions;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token) && !isExpired(state.auth.user);
export const selectCurrentUser = (state) => state.auth.user;
export default authSlice.reducer;

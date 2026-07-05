import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { checkSessionExpiry } from "./store/authSlice";
import { RequireAuth, RequireGuest } from "./routes/RouteGuards";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const dispatch = useDispatch();

  // Runs once on app boot (after redux-persist has rehydrated). Catches the
  // case where a token expired while the tab was closed, so a stale token
  // doesn't linger in state until the first API call happens to 401.
  useEffect(() => {
    dispatch(checkSessionExpiry());
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

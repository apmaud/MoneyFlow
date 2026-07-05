import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Link, Stack, TextField } from "@mui/material";

import AuthLayout from "../components/layout/AuthLayout";
import { loginUser } from "../store/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate("/home");
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your accounts.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            required
            fullWidth
            autoComplete="current-password"
          />

          <Button type="submit" variant="contained" size="large" disabled={status === "loading"}>
            {status === "loading" ? "Logging in…" : "Log in"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Link component={RouterLink} to="/signup" underline="hover" color="secondary">
              Don't have an account? Sign up
            </Link>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

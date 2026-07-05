import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Link, Stack, TextField } from "@mui/material";

import AuthLayout from "../components/layout/AuthLayout";
import { registerUser } from "../store/authSlice";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [localError, setLocalError] = useState(null);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords don't match.");
      return;
    }

    const result = await dispatch(
      registerUser({ name: form.name, email: form.email, password: form.password })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate("/home");
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Takes less than a minute.">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {(localError || error) && <Alert severity="error">{localError || error}</Alert>}

          <TextField
            label="Full name"
            value={form.name}
            onChange={handleChange("name")}
            required
            fullWidth
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <TextField
            label="Confirm password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
            fullWidth
            autoComplete="new-password"
          />

          <Button type="submit" variant="contained" size="large" disabled={status === "loading"}>
            {status === "loading" ? "Creating account…" : "Create account"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Link component={RouterLink} to="/login" underline="hover" color="secondary">
              Already have an account? Log in
            </Link>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

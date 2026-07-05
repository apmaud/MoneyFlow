import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { logout, selectCurrentUser } from "../store/authSlice";
import { fetchAccounts, selectAccounts, selectAccountsStatus, selectTotalBalance } from "../store/accountsSlice";
import { formatCurrency } from "../utils/formatCurrency";
import { moneyFontSx } from "../theme/theme";

function initialsFor(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const accounts = useSelector(selectAccounts);
  const accountsStatus = useSelector(selectAccountsStatus);
  const totalBalance = useSelector(selectTotalBalance);

  // Someone can land here via a bookmark without ever visiting /home first,
  // so the accounts summary uses the same idle-check pattern as the rest
  // of the app rather than assuming it's already loaded.
  useEffect(() => {
    if (accountsStatus === "idle") dispatch(fetchAccounts());
  }, [accountsStatus, dispatch]);

  // accountsSlice and transfersSlice both reset themselves in response to
  // this one action (see their extraReducers) — so this covers every
  // logout path, including the axios interceptor's automatic one on a
  // 401, not just this button.
  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  const isLoadingAccounts = accountsStatus === "loading" && accounts.length === 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/home")} sx={{ mb: 2 }} color="secondary">
          Back
        </Button>

        <Paper sx={{ border: "1px solid", borderColor: "divider", borderRadius: 4, p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: "secondary.main", fontSize: 26, fontWeight: 700 }}>
              {initialsFor(user?.name)}
            </Avatar>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5">{user?.name || "—"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || "—"}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <SummaryRow label="Accounts" value={isLoadingAccounts ? null : String(accounts.length)} />
            <SummaryRow label="Total funds" value={isLoadingAccounts ? null : formatCurrency(totalBalance)} mono />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Button variant="outlined" color="error" fullWidth onClick={handleLogout}>
            Log out
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {value === null ? (
        <CircularProgress size={14} thickness={5} />
      ) : (
        <Typography variant="body2" sx={mono ? moneyFontSx : undefined}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

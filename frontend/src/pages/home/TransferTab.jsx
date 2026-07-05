import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { selectAccounts } from "../../store/accountsSlice";
import { placeTransfer, resetTransferStatus } from "../../store/transfersSlice";
import { EmptyState } from "../../components/common/StatusDisplays";
import { formatCurrency } from "../../utils/formatCurrency";

const STATUS_COLOR = {
  Completed: "success",
  Approved: "success",
  Pending: "default",
  FlaggedForReview: "warning",
  Rejected: "error",
  Failed: "error",
};

function ResultBanner({ error, lastResult }) {
  if (!error && !lastResult) return null;
  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {lastResult && (
        <Alert severity={STATUS_COLOR[lastResult.status] === "error" ? "error" : "success"} icon={false}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <span>Transfer {lastResult.status === "Completed" ? "sent" : "submitted"}.</span>
            <Chip size="small" label={lastResult.status} color={STATUS_COLOR[lastResult.status] || "default"} />
          </Stack>
        </Alert>
      )}
    </>
  );
}

// Sub-tab 1: moving money between two accounts you own. Both sides are
// dropdowns — there's never a reason to type an account number here, since
// the frontend already has the full list with balances.
function BetweenOwnAccountsForm({ accounts, status, error, lastResult, onSubmit }) {
  const [form, setForm] = useState({ fromAccountId: "", toAccountId: "", amount: "" });

  const otherAccounts = useMemo(
    () => accounts.filter((a) => a.id !== form.fromAccountId),
    [accounts, form.fromAccountId]
  );

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const toAccount = accounts.find((a) => a.id === form.toAccountId);
    if (!toAccount) return;

    const ok = await onSubmit({ fromAccountId: form.fromAccountId, toAccountNumber: toAccount.accountNumber, amount: Number(form.amount) });
    if (ok) setForm({ fromAccountId: form.fromAccountId, toAccountId: "", amount: "" });
  }

  if (accounts.length < 2) {
    return (
      <EmptyState
        title="You need at least two accounts"
        description="Open a second account to move money between your own accounts."
      />
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        <ResultBanner error={error} lastResult={lastResult} />

        <TextField select label="From account" value={form.fromAccountId} onChange={handleChange("fromAccountId")} required fullWidth>
          {accounts.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              Account {a.accountNumber} — {formatCurrency(a.balance)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="To account"
          value={form.toAccountId}
          onChange={handleChange("toAccountId")}
          required
          fullWidth
          disabled={!form.fromAccountId}
          helperText={!form.fromAccountId ? "Choose a From account first" : " "}
        >
          {otherAccounts.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              Account {a.accountNumber} — {formatCurrency(a.balance)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Amount"
          type="number"
          value={form.amount}
          onChange={handleChange("amount")}
          required
          fullWidth
          inputProps={{ min: 0.01, step: "0.01" }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        />

        <Button type="submit" variant="contained" size="large" disabled={status === "loading"} sx={{ alignSelf: "flex-start" }}>
          {status === "loading" ? "Sending…" : "Send transfer"}
        </Button>
      </Stack>
    </Box>
  );
}

// Sub-tab 2: sending to someone else's account. No dropdown for the
// recipient at all — just your own From account, and their number typed in.
function ToSomeoneElseForm({ accounts, status, error, lastResult, onSubmit }) {
  const [form, setForm] = useState({ fromAccountId: "", toAccountNumber: "", amount: "" });

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onSubmit({
      fromAccountId: form.fromAccountId,
      toAccountNumber: form.toAccountNumber.trim(),
      amount: Number(form.amount),
    });
    if (ok) setForm({ fromAccountId: form.fromAccountId, toAccountNumber: "", amount: "" });
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        <ResultBanner error={error} lastResult={lastResult} />

        <TextField select label="From account" value={form.fromAccountId} onChange={handleChange("fromAccountId")} required fullWidth>
          {accounts.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              Account {a.accountNumber} — {formatCurrency(a.balance)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Their account number"
          value={form.toAccountNumber}
          onChange={handleChange("toAccountNumber")}
          required
          fullWidth
          placeholder="Enter their 10-digit account number"
          inputProps={{ maxLength: 10, inputMode: "numeric" }}
        />

        <TextField
          label="Amount"
          type="number"
          value={form.amount}
          onChange={handleChange("amount")}
          required
          fullWidth
          inputProps={{ min: 0.01, step: "0.01" }}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
        />

        <Button type="submit" variant="contained" size="large" disabled={status === "loading"} sx={{ alignSelf: "flex-start" }}>
          {status === "loading" ? "Sending…" : "Send transfer"}
        </Button>
      </Stack>
    </Box>
  );
}

export default function TransferTab({ onSwitchToCreate }) {
  const dispatch = useDispatch();
  const accounts = useSelector(selectAccounts);
  const { status, error, lastResult } = useSelector((state) => state.transfers);
  const [subTab, setSubTab] = useState("own");

  function handleSubTabChange(_, value) {
    dispatch(resetTransferStatus()); // don't carry a result/error from one flow into the other
    setSubTab(value);
  }

  async function submitTransfer(payload) {
    const result = await dispatch(placeTransfer(payload));
    return placeTransfer.fulfilled.match(result);
  }

  if (accounts.length === 0) {
    return (
      <Box sx={{ maxWidth: 480 }}>
        <EmptyState
          title="You'll need an account first"
          description="Create an account before you can send a transfer from it."
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={onSwitchToCreate}>
          Create an account
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Transfer money
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Move money between your own accounts, or send to someone else's.
      </Typography>

      <Tabs value={subTab} onChange={handleSubTabChange} sx={{ mb: 3, minHeight: 36 }}>
        <Tab value="own" label="Between your accounts" sx={{ minHeight: 36 }} />
        <Tab value="external" label="To someone else" sx={{ minHeight: 36 }} />
      </Tabs>

      {subTab === "own" ? (
        <BetweenOwnAccountsForm accounts={accounts} status={status} error={error} lastResult={lastResult} onSubmit={submitTransfer} />
      ) : (
        <ToSomeoneElseForm accounts={accounts} status={status} error={error} lastResult={lastResult} onSubmit={submitTransfer} />
      )}
    </Box>
  );
}

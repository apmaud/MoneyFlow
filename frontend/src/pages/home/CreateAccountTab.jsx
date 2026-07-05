import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Box, Button, InputAdornment, Stack, TextField, Typography } from "@mui/material";

import { createAccount, resetCreateStatus } from "../../store/accountsSlice";

export default function CreateAccountTab({ onCreated }) {
  const dispatch = useDispatch();
  const { createStatus, createError } = useSelector((state) => state.accounts);
  const [openingBalance, setOpeningBalance] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const amount = Number(openingBalance || 0);
    const result = await dispatch(createAccount({ openingBalance: amount }));
    if (createAccount.fulfilled.match(result)) {
      setOpeningBalance("");
      onCreated?.();
      dispatch(resetCreateStatus());
    }
  }

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Open a new account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Give it an opening balance — you can always transfer more in later.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.5}>
          {createError && <Alert severity="error">{createError}</Alert>}

          <TextField
            label="Opening balance"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            required
            fullWidth
            inputProps={{ min: 0, step: "0.01" }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          />

          <Button type="submit" variant="contained" size="large" disabled={createStatus === "loading"} sx={{ alignSelf: "flex-start" }}>
            {createStatus === "loading" ? "Creating…" : "Create account"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

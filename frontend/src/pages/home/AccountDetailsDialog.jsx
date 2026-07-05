import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import * as transfersApi from "../../api/transfersApi";
import { extractErrorMessage } from "../../api/axiosClient";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/StatusDisplays";
import { formatCurrency } from "../../utils/formatCurrency";
import { moneyFontSx } from "../../theme/theme";

const STATUS_COLOR = {
  Completed: "success",
  Approved: "success",
  Pending: "default",
  FlaggedForReview: "warning",
  Rejected: "error",
  Failed: "error",
};

// Fetched on-demand, locally, rather than through the global store — this
// view is opened occasionally per-account, not part of the always-visible
// page, so there's no benefit to caching it session-wide the way the main
// accounts/history lists are.
export default function AccountDetailsDialog({ account, open, onClose }) {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !account) return;

    let cancelled = false;
    setStatus("loading");
    setError(null);

    transfersApi
      .fetchAccountTransferHistory(account.id)
      .then((data) => {
        if (!cancelled) {
          setHistory(data);
          setStatus("succeeded");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(extractErrorMessage(err, "Could not load this account's history."));
          setStatus("failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, account]);

  function handleCopy() {
    if (account) navigator.clipboard?.writeText(account.accountNumber);
  }

  if (!account) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Account details
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Balance
            </Typography>
            <Typography variant="h5" sx={moneyFontSx}>
              {formatCurrency(account.balance)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Account number
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>
                {account.accountNumber}
              </Typography>
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Transfer history
        </Typography>

        {status === "loading" && <LoadingState label="Loading history…" />}
        {status === "failed" && <ErrorState message={error} />}
        {status === "succeeded" && history.length === 0 && (
          <EmptyState title="No transfers yet" description="This account hasn't sent or received any money yet." />
        )}

        {history.length > 0 && (
          <Stack spacing={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            {history.map((t, i) => (
              <Box key={t.id}>
                {i > 0 && <Divider />}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
                  <Box>
                    <Typography variant="body2">
                      {t.fromAccountId === account.id ? "Sent" : "Received"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(t.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Chip size="small" label={t.status} color={STATUS_COLOR[t.status] || "default"} />
                    <Typography variant="body2" sx={moneyFontSx}>
                      {formatCurrency(t.amount)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

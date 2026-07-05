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

// Everything shown here already exists on the TransferResponse the history
// list already fetched — no extra API call needed, unlike
// AccountDetailsDialog which fetches on demand.
export default function TransferDetailsDialog({ transfer, open, onClose }) {
  if (!transfer) return null;

  const rows = [
    { label: "From account", value: transfer.fromAccountNumber, mono: true },
    { label: "To account", value: transfer.toAccountNumber, mono: true },
    { label: "Amount", value: formatCurrency(transfer.amount), mono: true },
    { label: "Status", value: transfer.status },
    { label: "Sent", value: new Date(transfer.createdAt).toLocaleString() },
    ...(transfer.completedAt ? [{ label: "Completed", value: new Date(transfer.completedAt).toLocaleString() }] : []),
    ...(transfer.failureReason ? [{ label: "Failure reason", value: transfer.failureReason }] : []),
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Transfer details
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {rows.map((row, i) => (
            <Box key={row.label}>
              {i > 0 && <Divider sx={{ mb: 2 }} />}
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {row.label}
                </Typography>
                {row.label === "Status" ? (
                  <Chip size="small" label={row.value} color={STATUS_COLOR[row.value] || "default"} />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: "right",
                      wordBreak: "break-all",
                      ...(row.mono ? { fontFamily: "'IBM Plex Mono', monospace" } : {}),
                    }}
                  >
                    {row.value}
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Chip, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { fetchTransferHistory, selectTransferHistory, selectTransferHistoryStatus, selectTransferHistoryHasMore, selectTransferHistoryPage } from "../../store/transfersSlice";
import { selectAccounts } from "../../store/accountsSlice";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/StatusDisplays";
import { formatCurrency } from "../../utils/formatCurrency";
import { moneyFontSx } from "../../theme/theme";
import TransferDetailsDialog from "./TransferDetailsDialog";

const STATUS_COLOR = {
  Completed: "success",
  Approved: "success",
  Pending: "default",
  FlaggedForReview: "warning",
  Rejected: "error",
  Failed: "error",
};

function last4(accountNumber) {
  return accountNumber ? accountNumber.slice(-4) : "????";
}

export default function TransferHistorySection() {
  const dispatch = useDispatch();
  const history = useSelector(selectTransferHistory);
  const status = useSelector(selectTransferHistoryStatus);
  const hasMore = useSelector(selectTransferHistoryHasMore);
  const currentPage = useSelector(selectTransferHistoryPage);
  const error = useSelector((state) => state.transfers.historyError);
  const myAccounts = useSelector(selectAccounts);

  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const myAccountIds = useMemo(() => new Set(myAccounts.map((a) => a.id)), [myAccounts]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTransferHistory());
    }
  }, [status, dispatch]);

  // Real numbers on both sides now come straight from TransferResponse (see
  // TransferService's ToResponseAsync/ToResponseListAsync on the backend) —
  // masked to the last 4 digits here to keep the row compact; the details
  // dialog shows them in full.
  function ownershipInfo(transfer) {
    const fromMine = myAccountIds.has(transfer.fromAccountId);
    const toMine = myAccountIds.has(transfer.toAccountId);
    if (fromMine && toMine) return { tag: "Your accounts", icon: <SwapHorizIcon fontSize="small" color="action" /> };
    if (fromMine) return { tag: "Sent", icon: <NorthEastIcon fontSize="small" color="error" /> };
    return { tag: "Received", icon: <SouthWestIcon fontSize="small" color="success" /> };
  }

  return (
    <Box sx={{ mt: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Transfer history</Typography>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => dispatch(fetchTransferHistory())} disabled={status === "loading"}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {status === "loading" && history.length === 0 && <LoadingState label="Loading transfer history…" />}
      {status === "failed" && <ErrorState message={error} onRetry={() => dispatch(fetchTransferHistory())} />}
      {status === "succeeded" && history.length === 0 && (
        <EmptyState title="No transfers yet" description="Transfers you send or receive will show up here." />
      )}

      {history.length > 0 && (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
          {history.map((t, i) => {
            const { tag, icon } = ownershipInfo(t);
            return (
              <Box key={t.id}>
                {i > 0 && <Divider />}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  onClick={() => setSelectedTransfer(t)}
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                    {icon}
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" sx={{ fontFamily: "'IBM Plex Mono', monospace" }} noWrap>
                          •••• {last4(t.fromAccountNumber)} → •••• {last4(t.toAccountNumber)}
                        </Typography>
                        <Chip size="small" label={tag} variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(t.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
                    <Chip size="small" label={t.status} color={STATUS_COLOR[t.status] || "default"} />
                    <Typography variant="body2" sx={moneyFontSx}>
                      {formatCurrency(t.amount)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}

      {history.length > 0 && hasMore && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => dispatch(fetchTransferHistory({ page: currentPage + 1 }))}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading…" : "Load more"}
          </Button>
        </Stack>
      )}

      <TransferDetailsDialog transfer={selectedTransfer} open={Boolean(selectedTransfer)} onClose={() => setSelectedTransfer(null)} />
    </Box>
  );
}

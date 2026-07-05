import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Card, CardContent, IconButton, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import { fetchAccounts, selectAccounts, selectAccountsStatus, selectTotalBalance } from "../../store/accountsSlice";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/StatusDisplays";
import { formatCurrency } from "../../utils/formatCurrency";
import { moneyFontSx } from "../../theme/theme";
import AccountDetailsDialog from "./AccountDetailsDialog";
import TransferHistorySection from "./TransferHistorySection";

export default function AccountsTab() {
  const dispatch = useDispatch();
  const accounts = useSelector(selectAccounts);
  const status = useSelector(selectAccountsStatus);
  const total = useSelector(selectTotalBalance);
  const error = useSelector((state) => state.accounts.error);

  const isRefreshing = status === "loading" && accounts.length > 0;

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuAccount, setMenuAccount] = useState(null);
  const [dialogAccount, setDialogAccount] = useState(null);

  function openMenu(event, account) {
    setMenuAnchor(event.currentTarget);
    setMenuAccount(account);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuAccount(null);
  }

  function handleViewDetails() {
    setDialogAccount(menuAccount);
    closeMenu();
  }

  return (
    <Box>
      <Card
        sx={{
          mb: 4,
          bgcolor: "secondary.main",
          color: "white",
          border: "none",
        }}
      >
        <CardContent sx={{ py: 3.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                Total across all accounts
              </Typography>
              <Typography variant="h3" sx={{ ...moneyFontSx, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                {formatCurrency(total)}
              </Typography>
            </Box>
            <Tooltip title="Refresh balances">
              <IconButton onClick={() => dispatch(fetchAccounts())} sx={{ color: "white" }} disabled={status === "loading"}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {status === "loading" && accounts.length === 0 && <LoadingState label="Loading your accounts…" />}

      {status === "failed" && <ErrorState message={error} onRetry={() => dispatch(fetchAccounts())} />}

      {status === "succeeded" && accounts.length === 0 && (
        <EmptyState
          title="No accounts yet"
          description="Head to the Create account tab to open your first one."
        />
      )}

      {accounts.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
            opacity: isRefreshing ? 0.6 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "primary.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <AccountBalanceWalletOutlinedIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Account {account.accountNumber}
                    </Typography>
                  </Stack>
                  <IconButton size="small" onClick={(e) => openMenu(e, account)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography variant="h5" sx={moneyFontSx}>
                  {formatCurrency(account.balance)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleViewDetails}>View account details</MenuItem>
      </Menu>

      <AccountDetailsDialog
        account={dialogAccount}
        open={Boolean(dialogAccount)}
        onClose={() => setDialogAccount(null)}
      />

      <TransferHistorySection />
    </Box>
  );
}

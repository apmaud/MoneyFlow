import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Tab,
  Tabs,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

import ProfileIconButton from "./ProfileIconButton";
import BrandLogo from "./BrandLogo";

export const HOME_TABS = [
  { value: "accounts", label: "Accounts", icon: <AccountBalanceWalletOutlinedIcon /> },
  { value: "transfer", label: "Transfer money", icon: <SwapHorizOutlinedIcon /> },
  { value: "create", label: "Create account", icon: <AddCircleOutlineOutlinedIcon /> },
];

export default function AppShell({ activeTab, onTabChange, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar sx={{ gap: 2 }}>
          <BrandLogo />

          {/* Tabs live in the top bar on tablet/desktop; on mobile they move
              to a fixed bottom nav instead, so labels never get cramped. */}
          {!isMobile && (
            <Tabs
              value={activeTab}
              onChange={(_, v) => onTabChange(v)}
              sx={{ ml: 2, flexGrow: 1 }}
              textColor="secondary"
              indicatorColor="primary"
            >
              {HOME_TABS.map((tab) => (
                <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} iconPosition="start" />
              ))}
            </Tabs>
          )}

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            <ProfileIconButton />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 4 },
          pb: isMobile ? 10 : 4, // leave room above the fixed bottom nav
        }}
      >
        {children}
      </Box>

      {isMobile && (
        <BottomNavigation
          value={activeTab}
          onChange={(_, v) => onTabChange(v)}
          showLabels
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {HOME_TABS.map((tab) => (
            <BottomNavigationAction key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}

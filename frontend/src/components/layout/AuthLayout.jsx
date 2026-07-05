import { Box, Paper, Typography } from "@mui/material";
import PublicNavBar from "./PublicNavBar";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      <PublicNavBar />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: { xs: 4, md: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 3, sm: 4 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, color: "secondary.main" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Paper>
      </Box>
    </Box>
  );
}

import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PublicNavBar from "../components/layout/PublicNavBar";
import MoneyFlowHero from "../components/landing/MoneyFlowHero";

const FEATURES = [
  {
    title: "One place, every account",
    body: "Open as many accounts as you need and see every balance, and their total, at a glance.",
  },
  {
    title: "Transfers that don't double up",
    body: "Every transfer carries a unique key, so a slow connection or an accidental double-click never moves your money twice.",
  },
  {
    title: "Unusual activity gets a second look",
    body: "Large or rapid transfers are automatically held for review before funds move, not after.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <PublicNavBar />

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 5, md: 4 },
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2.25rem", sm: "2.75rem", md: "3.25rem" },
                color: "secondary.main",
                mb: 2,
              }}
            >
              Move money between your accounts, without the worry.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 480, mx: { xs: "auto", md: 0 } }}>
              MoneyFlow keeps every account you own in one view, and moves money between
              them safely — with duplicate-proof transfers and a fraud check that runs before
              anything is sent.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent={{ xs: "center", md: "flex-start" }}>
              <Button size="large" variant="contained" onClick={() => navigate("/signup")}>
                Get started
              </Button>
              <Button size="large" variant="outlined" color="secondary" onClick={() => navigate("/login")}>
                I already have an account
              </Button>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, width: "100%" }}>
            <MoneyFlowHero />
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 8, md: 12 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {FEATURES.map((f) => (
            <Box
              key={f.title}
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 1 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {f.body}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

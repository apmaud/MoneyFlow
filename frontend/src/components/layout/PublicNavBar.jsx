import { AppBar, Box, Button, Stack, Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";

export default function PublicNavBar() {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ py: 1.5, px: { xs: 2, md: 4 } }}>
        <BrandLogo />

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1}>
          <Button variant="text" color="secondary" onClick={() => navigate("/login")}>
            Log in
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate("/signup")}>
            Sign up
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

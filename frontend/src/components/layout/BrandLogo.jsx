import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../store/authSlice";

// Used in both PublicNavBar and AppShell. Checks auth state itself rather
// than assuming "which navbar renders me tells you where to go" — that way
// this stays correct even if it's ever reused somewhere both states are
// possible.
export default function BrandLogo({ variant = "h6" }) {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Typography
      variant={variant}
      onClick={() => navigate(isAuthenticated ? "/home" : "/")}
      sx={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        color: "secondary.main",
        cursor: "pointer",
        userSelect: "none",
        flexShrink: 0,
        "&:hover": { opacity: 0.8 },
      }}
    >
      MoneyFlow
    </Typography>
  );
}

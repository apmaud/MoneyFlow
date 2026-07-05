import { Avatar, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/authSlice";

function initialsFor(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function ProfileIconButton() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  return (
    <Tooltip title="Your profile">
      <IconButton onClick={() => navigate("/profile")} size="small" sx={{ ml: 1 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "secondary.main",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initialsFor(user?.name)}
        </Avatar>
      </IconButton>
    </Tooltip>
  );
}

import { Alert, Box, CircularProgress, Typography } from "@mui/material";

export function LoadingState({ label = "Loading…" }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress size={32} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Alert
      severity="error"
      sx={{ borderRadius: 2 }}
      action={
        onRetry ? (
          <Typography
            component="button"
            onClick={onRetry}
            sx={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              color: "inherit",
              textDecoration: "underline",
            }}
          >
            Try again
          </Typography>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}

export function EmptyState({ title, description }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        px: 2,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
}

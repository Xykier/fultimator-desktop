import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const NpcListLoading = () => {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Loading NPCs...
      </Typography>
    </Box>
  );
};

export default NpcListLoading;

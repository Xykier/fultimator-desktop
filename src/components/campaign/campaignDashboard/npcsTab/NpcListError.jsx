import React from "react";
import { Alert, Button } from "@mui/material";

const NpcListError = ({ loadError, loadNpcs }) => {
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      {loadError}
      <Button
        color="inherit"
        size="small"
        onClick={() => loadNpcs()}
        sx={{ ml: 2 }}
      >
        Retry
      </Button>
    </Alert>
  );
};

export default NpcListError;

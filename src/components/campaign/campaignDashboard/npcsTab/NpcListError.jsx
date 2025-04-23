import React from "react";
import { Alert, Button } from "@mui/material";
import { useNpcStore } from "./stores/npcDataStore";

const NpcListError = () => {

  const {loadError, loadNpcs} = useNpcStore();

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

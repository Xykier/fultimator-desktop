import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { CreateNewFolder, Link as LinkIcon } from "@mui/icons-material";

const NpcsTabHeader = ({ handleAddExistingNpc, setIsNewFolderDialogOpen }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography variant="h4">Campaign NPCs</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<LinkIcon />}
          onClick={handleAddExistingNpc}
          sx={{ mr: 1 }}
        >
          Link NPC
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsNewFolderDialogOpen(true)}
          startIcon={<CreateNewFolder />}
        >
          Create Folder
        </Button>
      </Box>
    </Box>
  );
};

export default NpcsTabHeader;

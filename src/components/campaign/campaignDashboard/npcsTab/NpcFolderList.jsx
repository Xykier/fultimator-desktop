import React from "react";
import {
  Box,
  Button,
  MenuItem,
} from "@mui/material";

const NpcFolderList = ({ folders, selectedFolderId, setSelectedFolderId }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      <Button
        variant={selectedFolderId === null ? "contained" : "outlined"}
        color="primary"
        onClick={() => setSelectedFolderId(null)}        
      >
        All NPCs
      </Button>
      {folders.map(folder => (
        <MenuItem key={folder.id} onClick={() => setSelectedFolderId(folder.id)}
          selected={selectedFolderId === folder.id}
        >
          {folder.name}
        </MenuItem>
      ))}
    </Box>
  );
};

export default NpcFolderList;
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
} from "@mui/material";

const NpcMoveFolderDialog = ({
  open,
  onClose,
  selectedFolder,
  folders,
  handleFolderChange,
  handleMoveToFolder,
}) => {
  // NPC Move to Folder Dialog
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Move to Folder</DialogTitle>
      <DialogContent sx={{ minWidth: 300, pt: 1 }}>
        <Select
          value={selectedFolder}
          onChange={handleFolderChange}
          fullWidth
          displayEmpty
          variant="outlined"
          size="small"
        >
          <MenuItem value="">
            <em>None (Root)</em>
          </MenuItem>
          {folders &&
            folders.map((folder) => (
              <MenuItem key={folder.id} value={folder.id}>
                {folder.name}
              </MenuItem>
            ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleMoveToFolder}
          variant="contained"
          color="primary"
        >
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NpcMoveFolderDialog;

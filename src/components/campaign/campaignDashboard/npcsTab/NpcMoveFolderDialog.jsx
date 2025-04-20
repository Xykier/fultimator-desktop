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
  // Recursive function to render folders with proper indentation
  const renderFolderOptions = (foldersList, depth = 0) => {
    if (!foldersList || foldersList.length === 0) return null;

    return foldersList.flatMap((folder) => {
      const indentation = "\u00A0".repeat(depth * 4); // Non-breaking spaces for indentation
      
      // Create an array with current folder
      const options = [
        <MenuItem key={folder.id} value={folder.id}>
          {indentation}{folder.name}
        </MenuItem>
      ];
      
      // Add children if they exist (recursive call)
      if (folder.children && folder.children.length > 0) {
        options.push(...renderFolderOptions(folder.children, depth + 1));
      }
      
      return options;
    });
  };

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
          {renderFolderOptions(folders)}
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
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  TextField,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Tooltip,
  Divider,
} from "@mui/material";
import PropTypes from "prop-types";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

const FolderNameDialogComponent = ({
  open,
  handleClose,
  folderName,
  setFolderName,
  handleAction,
  mode = "create", // "create" or "rename"
  maxLength = 50,
  folderNameError = "",
}) => {
  // Focus the input when dialog opens and select all text when in rename mode
  useEffect(() => {
    if (open) {
      // Short timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        const input = document.getElementById("folder-name-input");
        if (input) {
          input.focus();
          if (mode === "rename") {
            input.select();
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, mode]);

  // Helper for button actions
  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim() && !folderNameError) {
      handleAction();
    }
  };

  const isCreateMode = mode === "create";
  const dialogTitle = isCreateMode ? "Create New Folder" : "Rename Folder";
  const actionButtonText = isCreateMode ? "Create" : "Rename";
  const IconComponent = isCreateMode
    ? CreateNewFolderIcon
    : DriveFileRenameOutlineIcon;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 400,
          maxWidth: "30vw",
        },
      }}
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconComponent color="primary" />
            <Typography variant="h3">{dialogTitle}</Typography>
          </Box>
          <IconButton
            edge="end"
            aria-label="close"
            onClick={handleClose}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            id="folder-name-input"
            label="Folder Name"
            type="text"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            error={!!folderNameError}
            helperText={
              folderNameError || `${folderName?.length}/${maxLength} characters`
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FolderIcon color="action" />
                </InputAdornment>
              ),
              inputProps: { maxLength },
            }}
            variant="outlined"
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, pt: 1.5 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            variant="outlined"
            size="medium"
          >
            Cancel
          </Button>
          <Tooltip title={folderNameError || ""} placement="top">
            <span>
              <Button
                onClick={handleAction}
                variant="contained"
                size="medium"
                disabled={!folderName?.trim() || !!folderNameError}
                startIcon={<IconComponent />}
              >
                {actionButtonText}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </form>
    </Dialog>
  );
};

FolderNameDialogComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  folderName: PropTypes.string.isRequired,
  setFolderName: PropTypes.func.isRequired,
  handleAction: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["create", "rename"]),
  maxLength: PropTypes.number,
  folderNameError: PropTypes.string,
};

export default FolderNameDialogComponent;

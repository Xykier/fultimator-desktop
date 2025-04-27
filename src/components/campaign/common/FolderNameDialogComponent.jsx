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
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { useTranslate, replacePlaceholders } from "../../../translation/translate";

/**
 * Dialog component for creating or renaming folders
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.handleClose - Function to close the dialog
 * @param {string} props.folderName - Current folder name value
 * @param {Function} props.setFolderName - Function to update folder name
 * @param {Function} props.handleAction - Function to execute on form submission
 * @param {string} props.mode - Dialog mode: "create" or "rename"
 * @param {number} props.maxLength - Maximum length for folder name
 * @param {string} props.folderNameError - Error message for folder name validation
 * @param {string} props.title - Custom dialog title (optional, will use default if not provided)
 * @param {string} props.confirmButtonText - Custom confirm button text (optional)
 * @param {string} props.cancelButtonText - Custom cancel button text (optional)
 * @returns {React.ReactElement} Folder name dialog component
 */
const FolderNameDialogComponent = ({
  open,
  handleClose,
  folderName,
  setFolderName,
  handleAction,
  mode = "create", // "create" or "rename"
  maxLength = 50,
  folderNameError = "",
  title,
  confirmButtonText,
  cancelButtonText,
}) => {
  // Initialize translation hook
  const { t } = useTranslate();
  
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

  // Determine dialog properties based on mode
  const isCreateMode = mode === "create";
  const dialogTitle = title || (isCreateMode ? t("explorer_create_folder") : t("explorer_rename_folder"));
  const actionButtonText = confirmButtonText || (isCreateMode ? t("explorer_create") : t("explorer_rename"));
  const buttonCancelText = cancelButtonText || t("explorer_cancel");
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
          id="folder-name-dialog-title"
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
            label={t("explorer_folder_name")}
            type="text"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            error={!!folderNameError}
            helperText={
              folderNameError || replacePlaceholders(t("explorer_char_count"), { current: folderName?.length || 0, max: maxLength })
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
            {buttonCancelText}
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

export default FolderNameDialogComponent;
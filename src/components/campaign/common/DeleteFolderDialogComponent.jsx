import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslate } from "../../../translation/translate";

/**
 * Dialog component for confirming folder deletion
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.handleClose - Function to close the dialog
 * @param {Function} props.handleConfirmDelete - Function to execute on delete confirmation
 * @param {string} props.title - Custom dialog title (optional)
 * @param {string} props.message - Custom confirmation message (optional)
 * @param {string} props.confirmButtonText - Custom text for confirm button (optional)
 * @param {string} props.cancelButtonText - Custom text for cancel button (optional)
 * @returns {React.ReactElement} Delete folder confirmation dialog
 */
const DeleteFolderDialogComponent = ({
  open,
  handleClose,
  handleConfirmDelete,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
}) => {
  // Initialize translation hook
  const { t } = useTranslate();

  // Generate appropriate confirmation message based on folderToDelete
  const getConfirmationMessage = () => {
    if (message) return message;

    return t("explorer_delete_folder_generic_confirmation");
  };

  // Set titles and button texts with defaults from translations
  const dialogTitle = title || t("explorer_delete_folder");
  const buttonConfirmText = confirmButtonText || t("explorer_delete");
  const buttonCancelText = cancelButtonText || t("explorer_cancel");

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 400,
        },
      }}
      fullWidth
    >
      <DialogTitle
        id="delete-folder-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DeleteIcon color="error" />
          <Typography variant="h3">{dialogTitle}</Typography>
        </Box>
        <IconButton edge="end" onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2 }}>
        <DialogContentText>{getConfirmationMessage()}</DialogContentText>
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
        <Button
          onClick={handleConfirmDelete}
          color="error"
          variant="contained"
          size="medium"
          startIcon={<DeleteIcon />}
          autoFocus
        >
          {buttonConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFolderDialogComponent;

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";

const DeleteFolderDialogComponent = ({
  open,
  handleClose,
  folderToDelete,
  handleConfirmDelete,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-folder-dialog-title"
    >
      <DialogTitle id="delete-folder-dialog-title">Delete Folder</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deleting the folder "{folderToDelete?.name}" will unlink all NPCs
          inside from this campaign. The NPCs will remain in your database but
          will no longer be associated with this folder. Are you sure you want
          to continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleConfirmDelete}
          color="error"
          variant="contained"
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteFolderDialogComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  folderToDelete: PropTypes.object,
  handleConfirmDelete: PropTypes.func.isRequired,
};

export default DeleteFolderDialogComponent;

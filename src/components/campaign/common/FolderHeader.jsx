import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Tooltip,
  Button,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FolderOpen as FolderOpenIcon,
  Home as HomeIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Add as AddIcon,
  People as PeopleIcon,
  CheckBoxOutlined as SelectionIcon,
} from "@mui/icons-material";

const FolderHeader = ({
  selectedFolder,
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  viewMode = "grid",
  onChangeViewMode,
  onSelectAll,
  showAllFolders,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    onRenameFolder(selectedFolder.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteFolder(selectedFolder.id);
    handleMenuClose();
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          {selectedFolder ? (
            <FolderOpenIcon color="primary" sx={{ mr: 1.5 }} />
          ) : showAllFolders ? (
            <PeopleIcon color="primary" sx={{ mr: 1.5 }} />
          ) : (
            <HomeIcon color="primary" sx={{ mr: 1.5 }} />
          )}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
            {selectedFolder
              ? selectedFolder.name
              : showAllFolders
              ? "All Folders"
              : "Root"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={() => onCreateFolder(selectedFolder?.id)}
            sx={{ mr: 1 }}
          >
            New Folder
          </Button>

          <Tooltip title="Select All">
            <IconButton
              size="small"
              onClick={onSelectAll}
              sx={{ mr: 1 }}
            >
              <SelectionIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={viewMode === "grid" ? "List view" : "Grid view"}>
            <IconButton
              size="small"
              onClick={() =>
                onChangeViewMode(viewMode === "grid" ? "list" : "grid")
              }
              sx={{ mr: 1 }}
            >
              {viewMode === "grid" ? <ViewListIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>

          {selectedFolder && (
            <IconButton
              aria-label="folder options"
              aria-controls="folder-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Menu
        id="folder-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            overflow: "visible",
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleRename}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Folder</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Delete Folder</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default FolderHeader;

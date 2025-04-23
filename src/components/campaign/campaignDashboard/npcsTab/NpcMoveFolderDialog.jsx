import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";

const NpcMoveFolderDialog = ({
  open,
  onClose,
  selectedFolder,
  folders,
  handleMoveToFolder,
  currentFolderId = null,
}) => {
  const theme = useTheme();
  const [error, setError] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [localSelectedFolder, setLocalSelectedFolder] =
    useState(selectedFolder);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);

  // Reset error when dialog opens and build initial breadcrumb
  useEffect(() => {
    if (open) {
      setError("");
      setLocalSelectedFolder(selectedFolder);
      buildBreadcrumbPath(selectedFolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedFolder, folders]);

  // Validation before moving
  const validateAndMove = () => {
    // Don't allow moving to the same folder
    if (localSelectedFolder === currentFolderId) {
      setError("Item is already in this folder");
      return;
    }

    setError("");
    handleMoveToFolder(localSelectedFolder);
  };

  // Toggle folder expansion
  const toggleFolderExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Find folder path for breadcrumbs
  const findFolderPath = (folderId, foldersList, currentPath = []) => {
    if (!foldersList || foldersList.length === 0 || !folderId) return null;

    for (const folder of foldersList) {
      if (folder.id === folderId) {
        return [...currentPath, folder];
      }

      if (folder.children && folder.children.length > 0) {
        const path = findFolderPath(folderId, folder.children, [
          ...currentPath,
          folder,
        ]);
        if (path) return path;
      }
    }

    return null;
  };

  // Build breadcrumb path based on selected folder
  const buildBreadcrumbPath = (folderId) => {
    if (!folderId) {
      setBreadcrumbPath([]);
      return;
    }

    const path = findFolderPath(folderId, folders);
    setBreadcrumbPath(path || []);
  };

  // Handle folder selection
  const handleFolderSelect = (folderId) => {
    setLocalSelectedFolder(folderId);
    buildBreadcrumbPath(folderId);
  };

  // Navigate to breadcrumb folder
  const navigateToBreadcrumb = (folderId) => {
    setLocalSelectedFolder(folderId);
    buildBreadcrumbPath(folderId);
  };

  // Navigate to root folder
  const navigateToRoot = () => {
    setLocalSelectedFolder("");
    setBreadcrumbPath([]);
  };

  // Find folder by id
  const findFolderById = (folderId, foldersList) => {
    if (!foldersList || foldersList.length === 0) return null;

    for (const folder of foldersList) {
      if (folder.id === folderId) {
        return folder;
      }

      if (folder.children && folder.children.length > 0) {
        const found = findFolderById(folderId, folder.children);
        if (found) return found;
      }
    }

    return null;
  };

  // Get children of selected folder
  const getChildrenOfFolder = (folderId) => {
    if (!folderId) return folders;

    const folder = findFolderById(folderId, folders);
    return folder?.children || [];
  };

  // Recursive function to render folder tree
  const renderFolderTree = (foldersList, depth = 0) => {
    if (!foldersList || foldersList.length === 0) return null;

    return foldersList.map((folder) => {
      const hasChildren = folder.children && folder.children.length > 0;
      const isExpanded = expandedFolders[folder.id];
      const isSelected = localSelectedFolder === folder.id;
      const isCurrent = folder.id === currentFolderId;

      return (
        <React.Fragment key={folder.id}>
          <ListItem
            disablePadding
            sx={{
              pl: depth * 2,
              backgroundColor: isSelected
                ? alpha(theme.palette.primary.main, 0.1)
                : "transparent",
            }}
          >
            <ListItemButton
              onClick={() => handleFolderSelect(folder.id)}
              sx={{
                borderLeft: isSelected
                  ? `3px solid ${theme.palette.primary.main}`
                  : "none",
                pl: isSelected ? 0.7 : 1,
              }}
            >
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolderExpand(folder.id);
                  }}
                  sx={{ mr: 0.5, p: 0 }}
                >
                  {isExpanded ? (
                    <ExpandMoreIcon fontSize="small" />
                  ) : (
                    <ChevronRightIcon fontSize="small" />
                  )}
                </IconButton>
              )}
              {!hasChildren && <Box sx={{ width: 24, ml: 0.5 }} />}
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isCurrent ? (
                  <FolderSpecialIcon
                    fontSize="small"
                    color={isSelected ? "primary" : "secondary"}
                  />
                ) : (
                  <FolderIcon
                    fontSize="small"
                    color={isSelected ? "primary" : "action"}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 600 : 400}
                      noWrap
                      sx={{ mr: 1 }}
                    >
                      {folder.name}
                    </Typography>
                    {isCurrent && (
                      <Chip
                        label="Current"
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                {renderFolderTree(folder.children, depth + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  // Render current view folders
  const renderCurrentViewFolders = () => {
    const currentFolderChildren = getChildrenOfFolder(localSelectedFolder);

    if (currentFolderChildren.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            This folder is empty
          </Typography>
        </Box>
      );
    }

    return currentFolderChildren.map((folder) => {
      const isSelected = localSelectedFolder === folder.id;
      const isCurrent = folder.id === currentFolderId;

      return (
        <ListItem
          key={folder.id}
          disablePadding
          sx={{
            backgroundColor: isSelected
              ? alpha(theme.palette.primary.main, 0.1)
              : "transparent",
          }}
        >
          <ListItemButton
            onClick={() => handleFolderSelect(folder.id)}
            onDoubleClick={() => toggleFolderExpand(folder.id)}
            sx={{
              borderLeft: isSelected
                ? `3px solid ${theme.palette.primary.main}`
                : "none",
              pl: isSelected ? 0.7 : 1,
            }}
          >
            <ListItemIcon>
              {isCurrent ? (
                <FolderSpecialIcon
                  color={isSelected ? "primary" : "secondary"}
                />
              ) : (
                <FolderIcon color={isSelected ? "primary" : "action"} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    fontWeight={isSelected ? 600 : 400}
                    sx={{ mr: 1 }}
                  >
                    {folder.name}
                  </Typography>
                  {isCurrent && (
                    <Chip
                      label="Current"
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  // Check if the current folder is selected
  const isCurrentFolderSelected = localSelectedFolder === currentFolderId;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="move-to-folder-dialog-title"
    >
      <DialogTitle id="move-to-folder-dialog-title" sx={{ m: 0, p: 2 }}>
        <Box display="flex" alignItems="center">
          <FolderOpenIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Move to Folder
          </Typography>
          <Tooltip title="Close">
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 1, display: "flex", flexDirection: "column" }}>
        <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="folder navigation"
              maxItems={3}
              itemsBeforeCollapse={1}
              itemsAfterCollapse={2}
            >
              <Link
                underline="hover"
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={navigateToRoot}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                Root
              </Link>

              {breadcrumbPath.map((folder, index) => {
                const isLast = index === breadcrumbPath.length - 1;
                const isCurrent = folder.id === currentFolderId;
                return (
                  <Link
                    key={folder.id}
                    underline="hover"
                    color={isLast ? "text.primary" : "inherit"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      fontWeight: isLast ? 500 : 400,
                    }}
                    onClick={() => !isLast && navigateToBreadcrumb(folder.id)}
                  >
                    {folder.name}
                    {isCurrent && (
                      <Chip
                        label="Current"
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: "0.65rem" }}
                      />
                    )}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Paper>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>

        <Box
          sx={{
            display: "flex",
            height: "350px",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Left panel - folder tree */}
          <Box
            sx={{
              width: "35%",
              borderRight: `1px solid ${theme.palette.divider}`,
              overflowY: "auto",
            }}
          >
            <List dense disablePadding>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={navigateToRoot}
                  sx={{
                    backgroundColor: !localSelectedFolder
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                    borderLeft: !localSelectedFolder
                      ? `3px solid ${theme.palette.primary.main}`
                      : "none",
                    pl: !localSelectedFolder ? 0.7 : 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HomeIcon
                      fontSize="small"
                      color={!localSelectedFolder ? "primary" : "action"}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Root"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: !localSelectedFolder ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
              {renderFolderTree(folders)}
            </List>
          </Box>

          {/* Right panel - current folder view */}
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <List dense disablePadding>
              {renderCurrentViewFolders()}
            </List>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          size="medium"
        >
          Cancel
        </Button>
        <Tooltip
          title={
            isCurrentFolderSelected ? "Cannot move to the current folder" : ""
          }
          placement="top"
        >
          <span>
            <Button
              onClick={validateAndMove}
              variant="contained"
              color="primary"
              size="medium"
              disableElevation
              disabled={isCurrentFolderSelected}
            >
              Move
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default NpcMoveFolderDialog;

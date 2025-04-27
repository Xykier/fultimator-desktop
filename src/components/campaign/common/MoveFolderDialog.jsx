import React, { useState, useEffect, useCallback } from "react";
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
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  FolderSpecial as FolderSpecialIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  useTranslate,
  replacePlaceholders,
} from "../../../translation/translate";

/**
 * Dialog component for moving items between folders with responsive layout
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to handle dialog close
 * @param {string} props.selectedFolder - ID of the currently selected folder in the dialog
 * @param {Array} props.folders - Hierarchical folder structure
 * @param {Function} props.handleMoveToFolder - Function to execute move operation
 * @param {string|null} props.currentFolderId - ID of the folder where the item(s) are currently located
 * @param {string} props.title - Dialog title
 * @param {Object} props.itemLabels - Labels for items in singular and plural forms
 * @param {string} props.itemLabels.singular - Singular form of item label
 * @param {string} props.itemLabels.plural - Plural form of item label
 * @param {string} props.itemLabels.translationKey - Base translation key for item labels
 * @param {string} props.size - Dialog size: 'sm', 'md', or 'lg'
 * @param {number} props.treeHeight - Height of the folder tree container in pixels
 * @param {Object} props.customIcons - Custom icons for different folder types
 * @param {React.ReactNode} props.customIcons.root - Icon for root folder
 * @param {React.ReactNode} props.customIcons.folder - Icon for regular folders
 * @param {React.ReactNode} props.customIcons.current - Icon for current folder
 * @param {React.ReactNode} props.customIcons.breadcrumbSeparator - Icon for breadcrumb separator
 */
const MoveFolderDialog = ({
  open,
  onClose,
  selectedFolder = "",
  folders = [],
  handleMoveToFolder,
  currentFolderId = null,
  title = "",
  itemLabels = {
    singular: "item",
    plural: "items",
    translationKey: "explorer_item_generic",
  },
  size = "sm",
  treeHeight = 350,
  customIcons = {
    root: <HomeIcon fontSize="small" />,
    folder: <FolderIcon fontSize="small" />,
    current: <FolderSpecialIcon fontSize="small" />,
    breadcrumbSeparator: <NavigateNextIcon fontSize="small" />,
  },
}) => {
  // Initialize the translation hook
  const { t } = useTranslate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [error, setError] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [localSelectedFolder, setLocalSelectedFolder] = useState(selectedFolder);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);

  /**
   * Reset error when dialog opens and build initial breadcrumb
   */
  useEffect(() => {
    if (open) {
      setError("");
      setLocalSelectedFolder(selectedFolder);
      buildBreadcrumbPath(selectedFolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedFolder, folders]);

  /**
   * Validate before moving items
   */
  const validateAndMove = () => {
    // Don't allow moving to the same folder
    if (localSelectedFolder === currentFolderId) {
      setError(t("explorer_move_folder_error_same"));
      return;
    }

    setError("");
    handleMoveToFolder(localSelectedFolder);
  };

  /**
   * Toggle folder expansion in tree view
   *
   * @param {string} folderId - ID of folder to toggle
   * @param {Event} e - Click event (optional)
   */
  const toggleFolderExpand = (folderId, e) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  /**
   * Find folder path for breadcrumbs
   *
   * @param {string} folderId - ID of folder to find path for
   * @param {Array} foldersList - List of folders to search through
   * @param {Array} currentPath - Current path accumulator
   * @returns {Array|null} Array of folder objects in path or null
   */
  const findFolderPath = useCallback(
    (folderId, foldersList = folders, currentPath = []) => {
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
    },
    [folders]
  );

  /**
   * Build breadcrumb path based on selected folder
   *
   * @param {string} folderId - ID of selected folder
   */
  const buildBreadcrumbPath = useCallback(
    (folderId) => {
      if (!folderId) {
        setBreadcrumbPath([]);
        return;
      }

      const path = findFolderPath(folderId, folders);
      setBreadcrumbPath(path || []);
    },
    [findFolderPath, folders]
  );

  /**
   * Handle folder selection
   *
   * @param {string} folderId - ID of folder to select
   */
  const handleFolderSelect = useCallback(
    (folderId) => {
      setLocalSelectedFolder(folderId);
      buildBreadcrumbPath(folderId);
    },
    [buildBreadcrumbPath]
  );

  /**
   * Navigate to breadcrumb folder
   *
   * @param {string} folderId - ID of folder to navigate to
   */
  const navigateToBreadcrumb = useCallback(
    (folderId) => {
      setLocalSelectedFolder(folderId);
      buildBreadcrumbPath(folderId);
    },
    [buildBreadcrumbPath]
  );

  /**
   * Navigate to root folder
   */
  const navigateToRoot = useCallback(() => {
    setLocalSelectedFolder("");
    setBreadcrumbPath([]);
  }, []);

  /**
   * Navigate to parent folder (for mobile view)
   */
  const navigateToParent = useCallback(() => {
    if (breadcrumbPath.length > 0) {
      const parentIndex = breadcrumbPath.length - 2;
      if (parentIndex >= 0) {
        const parentFolder = breadcrumbPath[parentIndex];
        navigateToBreadcrumb(parentFolder.id);
      } else {
        navigateToRoot();
      }
    } else {
      navigateToRoot();
    }
  }, [breadcrumbPath, navigateToBreadcrumb, navigateToRoot]);

  /**
   * Find folder by id in hierarchical structure
   *
   * @param {string} folderId - ID of folder to find
   * @param {Array} foldersList - List of folders to search through
   * @returns {Object|null} Folder object or null
   */
  const findFolderById = useCallback(
    (folderId, foldersList = folders) => {
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
    },
    [folders]
  );

  /**
   * Get children of selected folder
   *
   * @param {string} folderId - ID of folder to get children for
   * @returns {Array} Array of child folder objects
   */
  const getChildrenOfFolder = useCallback(
    (folderId) => {
      if (!folderId) return folders;

      const folder = findFolderById(folderId, folders);
      return folder?.children || [];
    },
    [findFolderById, folders]
  );

  /**
   * Render folder tree recursively
   *
   * @param {Array} foldersList - List of folders to render
   * @param {number} depth - Current depth in tree
   * @returns {React.ReactNode} Rendered folder tree
   */
  const renderFolderTree = (foldersList, depth = 0) => {
    if (!foldersList || foldersList.length === 0) return null;

    return foldersList.map((folder) => {
      const hasChildren = folder.children && folder.children.length > 0;
      const isExpanded = expandedFolders[folder.id];
      const isSelected = localSelectedFolder === folder.id;
      const isCurrent = folder.id === currentFolderId;
      const folderName = folder.translationKey
        ? t(folder.translationKey)
        : folder.name;

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
                  onClick={(e) => toggleFolderExpand(folder.id, e)}
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
                {isCurrent
                  ? React.cloneElement(customIcons.current, {
                      color: isSelected ? "primary" : "secondary",
                      fontSize: "small",
                    })
                  : React.cloneElement(customIcons.folder, {
                      color: isSelected ? "primary" : "action",
                      fontSize: "small",
                    })}
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
                      {folderName}
                    </Typography>
                    {isCurrent && (
                      <Chip
                        label={t("explorer_current_folder_chip")}
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

  /**
   * Render folder items for the current view
   *
   * @returns {React.ReactNode} Rendered current folder content
   */
  const renderFolderItems = () => {
    const currentFolderChildren = getChildrenOfFolder(localSelectedFolder);

    if (currentFolderChildren.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {t("explorer_folder_empty")}
          </Typography>
        </Box>
      );
    }

    return currentFolderChildren.map((folder) => {
      const isSelected = localSelectedFolder === folder.id;
      const isCurrent = folder.id === currentFolderId;
      const folderName = folder.translationKey
        ? t(folder.translationKey)
        : folder.name;

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
              {isCurrent
                ? React.cloneElement(customIcons.current, {
                    color: isSelected ? "primary" : "secondary",
                  })
                : React.cloneElement(customIcons.folder, {
                    color: isSelected ? "primary" : "action",
                  })}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    fontWeight={isSelected ? 600 : 400}
                    noWrap
                    sx={{ mr: 1 }}
                  >
                    {folderName}
                  </Typography>
                  {isCurrent && (
                    <Chip
                      label={t("explorer_current_folder_chip")}
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

  /**
   * Render mobile view with folder hierarchy
   *
   * @returns {React.ReactNode} Mobile view UI
   */
  const renderMobileView = () => {
    // Get current folder name for header
    let currentFolderName = t("explorer_root_folder");
    if (localSelectedFolder && breadcrumbPath.length > 0) {
      const currentFolder = breadcrumbPath[breadcrumbPath.length - 1];
      currentFolderName = currentFolder.translationKey
        ? t(currentFolder.translationKey)
        : currentFolder.name;
    }

    const isRoot = localSelectedFolder === "";

    return (
      <>
        <Box sx={{ mb: 2 }}>
          <Paper
            variant="outlined"
            sx={{ p: 1, display: "flex", alignItems: "center" }}
          >
            {!isRoot && (
              <IconButton
                size="small"
                onClick={navigateToParent}
                sx={{ mr: 1 }}
                edge="start"
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              {isRoot ? (
                React.cloneElement(customIcons.root, { sx: { mr: 1 } })
              ) : (
                React.cloneElement(customIcons.folder, { sx: { mr: 1 } })
              )}
              <Typography variant="subtitle1" fontWeight={500} noWrap>
                {currentFolderName}
              </Typography>
            </Box>
          </Paper>
        </Box>
        <Box
          sx={{
            height: treeHeight,
            border: `1px solid ${theme.palette.divider}`,
            overflowY: "auto",
          }}
        >
          <List dense disablePadding>
            {isRoot && (
              <>
                {folders.length === 0 && (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("explorer_folder_empty")}
                    </Typography>
                  </Box>
                )}
                {folders.map((folder) => {
                  const isCurrent = folder.id === currentFolderId;
                  const folderName = folder.translationKey
                    ? t(folder.translationKey)
                    : folder.name;

                  return (
                    <ListItem key={folder.id} disablePadding>
                      <ListItemButton onClick={() => handleFolderSelect(folder.id)}>
                        <ListItemIcon>
                          {isCurrent
                            ? React.cloneElement(customIcons.current, {
                                color: "secondary",
                              })
                            : React.cloneElement(customIcons.folder, {
                                color: "action",
                              })}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ mr: 1 }}>{folderName}</Typography>
                              {isCurrent && (
                                <Chip
                                  label={t("explorer_current_folder_chip")}
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
                })}
              </>
            )}
            {!isRoot && renderFolderItems()}
          </List>
        </Box>
      </>
    );
  };

  /**
   * Render desktop view with folder tree and folder content
   *
   * @returns {React.ReactNode} Desktop view UI
   */
  const renderDesktopView = () => {
    return (
      <>
        <FormControl fullWidth error={!!error} sx={{ mb: 2 }}>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <Breadcrumbs
              separator={customIcons.breadcrumbSeparator}
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
                {React.cloneElement(customIcons.root, { sx: { mr: 0.5 } })}
                {t("explorer_root_folder")}
              </Link>

              {breadcrumbPath.map((folder, index) => {
                const isLast = index === breadcrumbPath.length - 1;
                const isCurrent = folder.id === currentFolderId;
                const folderName = folder.translationKey
                  ? t(folder.translationKey)
                  : folder.name;

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
                    {folderName}
                    {isCurrent && (
                      <Chip
                        label={t("explorer_current_folder_chip")}
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
            height: treeHeight,
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
                    {React.cloneElement(customIcons.root, {
                      color: !localSelectedFolder ? "primary" : "action",
                      fontSize: "small",
                    })}
                  </ListItemIcon>
                  <ListItemText
                    primary={t("explorer_root_folder")}
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
              {renderFolderItems()}
            </List>
          </Box>
        </Box>
      </>
    );
  };

  // Check if the current folder is selected
  const isCurrentFolderSelected = localSelectedFolder === currentFolderId;

  // Get dialog title from prop or generate from translation
  const dialogTitle =
    title ||
    replacePlaceholders(t(`${itemLabels.translationKey}_move_to_folder`), {
      count: 1,
      itemLabel:
        t(`${itemLabels.translationKey}_singular`) || itemLabels.singular,
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={size}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          ...(isMobile && {
            m: 0,
            height: "100%",
            maxHeight: "none",
          }),
        },
      }}
    >
      <DialogTitle
        id="move-to-folder-dialog-title"
        sx={{
          m: 0,
          p: isMobile ? 1.5 : 2,
          ...(isMobile && {
            position: "sticky",
            top: 0,
            backgroundColor: theme.palette.background.paper,
            zIndex: 1,
          }),
        }}
      >
        <Box display="flex" alignItems="center">
          <FolderOpenIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant={isMobile ? "h6" : "h4"}
            component="div"
            sx={{ flexGrow: 1 }}
            noWrap
          >
            {dialogTitle}
          </Typography>
          <Tooltip title={t("explorer_close")}>
            <IconButton
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

      <Divider />

      <DialogContent
        sx={{
          pb: 1,
          display: "flex",
          flexDirection: "column",
          p: isMobile ? 1.5 : 2,
        }}
      >
        {error && (
          <FormHelperText error sx={{ mb: 2 }}>
            {error}
          </FormHelperText>
        )}

        {isMobile ? renderMobileView() : renderDesktopView()}
      </DialogContent>

      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          py: 2,
          ...(isMobile && {
            position: "sticky",
            bottom: 0,
            backgroundColor: theme.palette.background.paper,
            zIndex: 1,
            boxShadow: "0px -2px 4px rgba(0,0,0,0.05)",
          }),
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          fullWidth={isMobile}
          sx={isMobile ? { mr: 1 } : {}}
        >
          {t("explorer_cancel")}
        </Button>
        <Tooltip
          title={
            isCurrentFolderSelected
              ? t("explorer_move_folder_error_same_tooltip")
              : ""
          }
          placement="top"
        >
          <span style={{ width: isMobile ? "100%" : "auto" }}>
            <Button
              onClick={validateAndMove}
              variant="contained"
              color="primary"
              size={isMobile ? "small" : "medium"}
              disableElevation
              disabled={isCurrentFolderSelected}
              fullWidth={isMobile}
            >
              {t("explorer_move")}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default MoveFolderDialog;
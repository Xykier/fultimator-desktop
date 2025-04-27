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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Add as AddIcon,
  CheckBoxOutlined as SelectionIcon,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";
import {
  useTranslate,
  replacePlaceholders,
} from "../../../translation/translate";

/**
 * Component for displaying folder header with actions and menu
 *
 * @param {Object} props
 * @param {Object|null} props.selectedFolder - Currently selected folder object
 * @param {Function} props.onRenameFolder - Function to handle folder rename action
 * @param {Function} props.onDeleteFolder - Function to handle folder delete action
 * @param {Function} props.onCreateFolder - Function to handle creating a new folder
 * @param {string} props.viewMode - Current view mode (grid/list)
 * @param {Function} props.onChangeViewMode - Function to toggle between view modes
 * @param {Function} props.onSelectAll - Function to select all items
 * @param {boolean} props.showAllFolders - Whether all folders view is active
 * @param {Object} props.customIcons - Custom icons for different folder types
 * @param {React.ReactNode} props.customIcons.root - Icon for root folder
 * @param {React.ReactNode} props.customIcons.folder - Icon for regular folders
 * @param {React.ReactNode} props.customIcons.allFolders - Icon for all folders view
 * @param {Object} props.itemLabels - Labels for items in singular and plural forms
 * @param {string} props.itemLabels.singular - Singular form of item label
 * @param {string} props.itemLabels.plural - Plural form of item label
 * @param {string} props.itemLabels.translationKey - Base translation key for item labels
 */
const FolderHeader = ({
  selectedFolder,
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  viewMode = "grid",
  onChangeViewMode,
  onSelectAll,
  showAllFolders,
  customIcons,
  itemLabels = {
    singular: "item",
    plural: "items",
    translationKey: "explorer_item_generic",
  },
}) => {
  // Initialize the translation hook
  const { t } = useTranslate();
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Menu states
  const [folderMenuAnchor, setFolderMenuAnchor] = useState(null);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);
  
  const folderMenuOpen = Boolean(folderMenuAnchor);
  const actionsMenuOpen = Boolean(actionsMenuAnchor);

  /**
   * Handle opening the folder options menu
   *
   * @param {Event} event - Click event
   */
  const handleFolderMenuOpen = (event) => {
    setFolderMenuAnchor(event.currentTarget);
  };

  /**
   * Handle opening the actions menu (for mobile)
   *
   * @param {Event} event - Click event
   */
  const handleActionsMenuOpen = (event) => {
    setActionsMenuAnchor(event.currentTarget);
  };

  /**
   * Close the folder options menu
   */
  const handleFolderMenuClose = () => {
    setFolderMenuAnchor(null);
  };

  /**
   * Close the actions menu
   */
  const handleActionsMenuClose = () => {
    setActionsMenuAnchor(null);
  };

  /**
   * Handle folder rename action
   */
  const handleRename = () => {
    onRenameFolder(selectedFolder.id);
    handleFolderMenuClose();
  };

  /**
   * Handle folder delete action
   */
  const handleDelete = () => {
    onDeleteFolder(selectedFolder.id);
    handleFolderMenuClose();
  };

  /**
   * Get current folder title based on context
   *
   * @returns {string} Translated folder title
   */
  const getFolderTitle = () => {
    if (selectedFolder) {
      return selectedFolder.translationKey
        ? t(selectedFolder.translationKey)
        : selectedFolder.name;
    } else if (showAllFolders) {
      return t("explorer_all_folders");
    } else {
      return t("explorer_root_folder");
    }
  };

  /**
   * Get current folder icon based on context
   *
   * @returns {React.ReactNode} Folder icon
   */
  const getFolderIcon = () => {
    if (selectedFolder) {
      return customIcons.folder;
    } else if (showAllFolders) {
      return customIcons.allFolders;
    } else {
      return customIcons.root;
    }
  };

  /**
   * Get translated label for "Select All" tooltip
   *
   * @returns {string} Translated label with plural item name
   */
  const getSelectAllLabel = () => {
    const base = t(`${itemLabels.translationKey}_select_all`) || t("explorer_select_all");
    return replacePlaceholders(base, {
      items: t(`${itemLabels.translationKey}_plural`) || itemLabels.plural,
    });
  };

  /**
   * Handle view mode change from mobile menu
   */
  const handleViewModeChange = () => {
    onChangeViewMode(viewMode === "grid" ? "list" : "grid");
    handleActionsMenuClose();
  };

  /**
   * Handle select all from mobile menu
   */
  const handleSelectAll = () => {
    onSelectAll();
    handleActionsMenuClose();
  };

  /**
   * Handle new folder creation from mobile menu
   */
  const handleCreateFolder = () => {
    onCreateFolder(selectedFolder?.id);
    handleActionsMenuClose();
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
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
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 1,
        }}
      >
        {/* Folder title with icon */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            flex: { xs: 1, sm: "1 0 auto" },
            minWidth: 0, // This helps with text overflow
          }}
        >
          {getFolderIcon()}
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h2" 
            sx={{ 
              fontWeight: 500,
              ml: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {getFolderTitle()}
          </Typography>
        </Box>

        {/* Action buttons - Desktop & tablet */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Tooltip title={t("explorer_new_folder")}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => onCreateFolder(selectedFolder?.id)}
                sx={{ mr: 1, display: { xs: "none", md: "flex" } }}
              >
                {t("explorer_new_folder")}
              </Button>
            </Tooltip>
            
            {/* Icon-only on tablet */}
            {isTablet && !isMobile && (
              <Tooltip title={t("explorer_new_folder")}>
                <IconButton 
                  size="small" 
                  onClick={() => onCreateFolder(selectedFolder?.id)}
                  sx={{ mr: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title={getSelectAllLabel()}>
              <IconButton size="small" onClick={onSelectAll} sx={{ mr: 1 }}>
                <SelectionIcon />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                viewMode === "grid"
                  ? t("explorer_list_view")
                  : t("explorer_grid_view")
              }
            >
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

            {/* Folder options menu (only for selected folders) */}
            {selectedFolder && (
              <Tooltip title={t("explorer_folder_options")}>
                <IconButton onClick={handleFolderMenuOpen} size="small">
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        {/* Mobile actions menu button */}
        {isMobile && (
          <IconButton 
            size="small" 
            onClick={handleActionsMenuOpen}
            edge="end"
            sx={{ ml: "auto" }}
          >
            <MoreHorizIcon />
          </IconButton>
        )}
      </Box>

      {/* Folder options menu */}
      <Menu
        id="folder-menu"
        anchorEl={folderMenuAnchor}
        open={folderMenuOpen}
        onClose={handleFolderMenuClose}
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
          <ListItemText>{t("explorer_rename_folder")}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>{t("explorer_delete_folder")}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Mobile actions menu */}
      <Menu
        id="actions-menu"
        anchorEl={actionsMenuAnchor}
        open={actionsMenuOpen}
        onClose={handleActionsMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            overflow: "visible",
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleCreateFolder}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("explorer_new_folder")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSelectAll}>
          <ListItemIcon>
            <SelectionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{getSelectAllLabel()}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleViewModeChange}>
          <ListItemIcon>
            {viewMode === "grid" ? <ViewListIcon fontSize="small" /> : <GridViewIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {viewMode === "grid" ? t("explorer_list_view") : t("explorer_grid_view")}
          </ListItemText>
        </MenuItem>
        {selectedFolder && (
          <>
            <Divider />
            <MenuItem onClick={handleRename}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("explorer_rename_folder")}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText>{t("explorer_delete_folder")}</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Paper>
  );
};

export default FolderHeader;
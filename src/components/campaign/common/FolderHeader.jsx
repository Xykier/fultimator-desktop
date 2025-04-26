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
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Add as AddIcon,
  CheckBoxOutlined as SelectionIcon,
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

  // Menu state management
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  /**
   * Handle opening the folder options menu
   *
   * @param {Event} event - Click event
   */
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Close the folder options menu
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle folder rename action
   */
  const handleRename = () => {
    onRenameFolder(selectedFolder.id);
    handleMenuClose();
  };

  /**
   * Handle folder delete action
   */
  const handleDelete = () => {
    onDeleteFolder(selectedFolder.id);
    handleMenuClose();
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
        {/* Folder title with icon */}
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          {getFolderIcon()}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
            {getFolderTitle()}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title={t("explorer_new_folder")}>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={() => onCreateFolder(selectedFolder?.id)}
              sx={{ mr: 1 }}
            >
              {t("explorer_new_folder")}
            </Button>
          </Tooltip>

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
              <IconButton onClick={handleMenuOpen} size="small">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Folder options menu */}
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
    </Paper>
  );
};

export default FolderHeader;

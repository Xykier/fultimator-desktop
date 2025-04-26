import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import {
  FolderOutlined,
  FolderOpenOutlined,
  ExpandMore,
  ChevronRight,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";

/**
 * Sidebar component displaying folder hierarchy with navigation capabilities
 * 
 * @param {Object} props
 * @param {Array} props.folders - Array of folder objects with hierarchical structure
 * @param {string|null} props.selectedFolderId - ID of the currently selected folder
 * @param {Function} props.setSelectedFolderId - Function to update selected folder
 * @param {boolean} props.showAllFolders - Whether all folders are shown in expanded view
 * @param {Function} props.setShowAllFolders - Function to toggle showing all folders
 * @param {string} props.rootFolderName - Custom name for the root folder (default: "Root")
 * @param {boolean} props.collapsible - Whether folders can be collapsed/expanded (default: true)
 * @param {Object} props.initialExpandedState - Object mapping folder IDs to their initial expanded state
 * @param {Function} props.onFolderSelect - Optional callback when a folder is selected
 */
const FolderSidebar = ({
  folders = [],
  selectedFolderId = null,
  setSelectedFolderId,
  showAllFolders = false,
  setShowAllFolders,
  rootFolderName = null,
  collapsible = true,
  initialExpandedState = {},
  onFolderSelect = null,
}) => {
  // Translation hook
  const { t } = useTranslate();
  
  // State for tracking which folders are expanded in the sidebar
  const [expandedFolders, setExpandedFolders] = useState(initialExpandedState);

  /**
   * Toggle expansion state of a folder
   * 
   * @param {string} folderId - ID of folder to toggle
   * @param {Event} e - Click event
   */
  const toggleFolderExpand = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  /**
   * Handle folder selection
   * 
   * @param {string} folderId - ID of the folder to select
   */
  const handleSelectFolder = (folderId) => {
    // Toggle selection if clicking the same folder again
    const newSelectedId = folderId === selectedFolderId ? null : folderId;
    setSelectedFolderId(newSelectedId);
    
    // Reset "show all folders" view if active
    if (showAllFolders) {
      setShowAllFolders(false);
    }
    
    // Call optional callback if provided
    if (onFolderSelect) {
      onFolderSelect(newSelectedId);
    }
  };

  /**
   * Select root folder and reset view
   */
  const handleSelectRoot = () => {
    setSelectedFolderId(null);
    setShowAllFolders(false);
    
    if (onFolderSelect) {
      onFolderSelect(null);
    }
  };

  /**
   * Recursively render folder hierarchy
   * 
   * @param {Array} folderList - Array of folders to render
   * @param {number} depth - Current nesting depth for indentation
   * @returns {React.ReactNode} - Rendered folder list items
   */
  const renderFolders = (folderList, depth = 0) => {
    if (!folderList || !Array.isArray(folderList) || folderList.length === 0) {
      return null;
    }

    return folderList.map((folder) => {
      const isExpanded = expandedFolders[folder.id];
      const isSelected = folder.id === selectedFolderId;
      const hasChildren = folder.children && folder.children.length > 0;

      return (
        <React.Fragment key={folder.id}>
          <ListItem
            disablePadding
            sx={{
              pl: depth * 2,
            }}
          >
            <ListItemButton
              onClick={() => handleSelectFolder(folder.id)}
              selected={isSelected}
              sx={{
                borderRadius: 1,
                m: 0.5,
                pl: 1,
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              {/* Expand/Collapse button for folders with children */}
              {hasChildren && collapsible ? (
                <IconButton
                  size="small"
                  onClick={(e) => toggleFolderExpand(folder.id, e)}
                  sx={{ mr: 0.5, p: 0 }}
                >
                  {isExpanded ? (
                    <ExpandMore fontSize="small" />
                  ) : (
                    <ChevronRight fontSize="small" />
                  )}
                </IconButton>
              ) : (
                <Box sx={{ width: 24, mr: 0.5 }} />
              )}
              
              {/* Folder icon */}
              <ListItemIcon sx={{ minWidth: 32 }}>
                  {isExpanded ? (
                    <FolderOpenOutlined
                      fontSize="small"
                      color={isSelected ? "primary" : "action"}
                    />
                  ) : (
                    <FolderOutlined
                      fontSize="small"
                      color={isSelected ? "primary" : "action"}
                    />
                  )}
              </ListItemIcon>
              
              {/* Folder name */}
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    noWrap
                    fontWeight={isSelected ? 600 : 400}
                    title={folder.name}
                  >
                    {folder.name}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
          
          {/* Nested folders (children) */}
          {hasChildren && collapsible && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderFolders(folder.children, depth + 1)}
              </List>
            </Collapse>
          )}
          
          {/* Always show children if collapsible is false */}
          {hasChildren && !collapsible && (
            <List component="div" disablePadding>
              {renderFolders(folder.children, depth + 1)}
            </List>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        height: "100%",
        width: 240,
        overflowY: "auto",
        borderRadius: 1,
      }}
    >
      {/* Sidebar header */}
      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{ ml: 1, flex: 1 }}
        >
          {t("explorer_folders")}
        </Typography>
      </Box>
      <Divider />
      
      {/* Folder list */}
      <List dense disablePadding>
        {/* Root folder item */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleSelectRoot}
            selected={selectedFolderId === null && showAllFolders === false}
            sx={{
              borderRadius: 1,
              m: 0.5,
              "&.Mui-selected": {
                backgroundColor: "action.selected",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <HomeIcon
                fontSize="small"
                color={selectedFolderId === null && !showAllFolders ? "primary" : "action"}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  fontWeight={selectedFolderId === null && !showAllFolders ? 600 : 400}
                >
                  {rootFolderName || t("explorer_root_folder")}
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
        
        {/* Render all folders recursively */}
        {renderFolders(folders)}
      </List>
    </Paper>
  );
};

export default FolderSidebar;
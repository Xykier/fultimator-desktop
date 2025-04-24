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
import { useNpcFiltersStore } from "./stores/npcFiltersStore";
import { useNpcFoldersStore } from "./stores/npcFolderStore";

const NpcFolderSidebar = () => {
  const {
    selectedNpcFolderId,
    setSelectedNpcFolderId,
    showAllFolders,
    setShowAllFolders,
  } = useNpcFiltersStore();
  const { npcFolders } = useNpcFoldersStore();
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolderExpand = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleSelectFolder = (folderId) => {
    setSelectedNpcFolderId(folderId === selectedNpcFolderId ? null : folderId);
    if (showAllFolders) {
      setShowAllFolders(false);
    }
  };

  const renderFolders = (folders, depth = 0) => {
    if (!folders || !folders.length) return null;

    return folders.map((folder) => {
      const isExpanded = expandedFolders[folder.id];
      const isSelected = folder.id === selectedNpcFolderId;
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
              {hasChildren ? (
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
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    noWrap
                    fontWeight={isSelected ? 600 : 400}
                  >
                    {folder.name}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderFolders(folder.children, depth + 1)}
              </List>
            </Collapse>
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
      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{ ml: 1, flex: 1 }}
        >
          Folders
        </Typography>
      </Box>
      <Divider />
      <List dense disablePadding>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setSelectedNpcFolderId(null);
              setShowAllFolders(false);
            }}
            selected={selectedNpcFolderId === null && showAllFolders === false}
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
                color={selectedNpcFolderId === null ? "primary" : "action"}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  fontWeight={selectedNpcFolderId === null ? 600 : 400}
                >
                  Root
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
        {renderFolders(npcFolders)}
      </List>
    </Paper>
  );
};

export default NpcFolderSidebar;

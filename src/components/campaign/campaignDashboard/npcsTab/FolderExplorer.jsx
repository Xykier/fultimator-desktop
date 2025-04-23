import React, { useState, useEffect } from "react";
import {
  Breadcrumbs,
  Link,
  Button,
  Box,
} from "@mui/material";
import {
  Folder,
  Home,
  People,
} from "@mui/icons-material";
import { useNpcFiltersStore } from "./stores/npcFiltersStore";
import { useNpcFoldersStore } from "./stores/npcFolderStore";

const FolderExplorer = () => {

  // Get state from the store
  const selectedFolderId = useNpcFiltersStore((state) => state.selectedNpcFolderId);
  const setSelectedFolderId = useNpcFiltersStore((state) => state.setSelectedNpcFolderId);
  const showAllFolders = useNpcFiltersStore((state) => state.showAllFolders);
  const setShowAllFolders = useNpcFiltersStore((state) => state.setShowAllFolders);
  const folders = useNpcFoldersStore((state) => state.npcFolders);

  // Process folders to create a flat structure for easier operations
  const [flatFolders, setFlatFolders] = useState([]);

  // Flatten the nested folder structure on component mount or when folders change
  useEffect(() => {
    const flattenedFolders = [];
    
    const flattenFolders = (folderArray) => {
      folderArray.forEach(folder => {
        // Extract children before adding to flat list
        const { children, ...folderWithoutChildren } = folder;
        
        // Ensure parentId is null if undefined
        const normalizedFolder = {
          ...folderWithoutChildren,
          parentId: folderWithoutChildren.parentId === undefined ? null : folderWithoutChildren.parentId
        };
        
        flattenedFolders.push(normalizedFolder);
        
        // Process children recursively
        if (children && children.length > 0) {
          flattenFolders(children);
        }
      });
    };
    
    flattenFolders(folders);
    setFlatFolders(flattenedFolders);
  }, [folders, setFlatFolders]);

  const buildBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentFolderId = selectedFolderId;
    while (currentFolderId) {
      const folder = flatFolders.find((f) => f.id === currentFolderId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentFolderId = folder.parentId;
      } else {
        currentFolderId = null;
      }
    }
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  const handleBreadcrumbClick = (folderId) => {
    setSelectedFolderId(folderId);
  };

  const goToRoot = () => {
    setShowAllFolders(false);
    setSelectedFolderId(null);
  };

  const goToAllFolders = () => {
    setShowAllFolders(true);
    setSelectedFolderId(null);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          variant={showAllFolders ? "contained" : "outlined"}
          startIcon={<People />}
          onClick={goToAllFolders}
          sx={{ mr: 2 }}
        >
          All Folders
        </Button>
        
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            onClick={goToRoot}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          {breadcrumbs.map((folder) => (
            <Link
              key={folder.id}
              underline="hover"
              color="inherit"
              onClick={() => handleBreadcrumbClick(folder.id)}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>
    </div>
  );
};

export default FolderExplorer;
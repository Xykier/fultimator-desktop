import React, { useState, useEffect } from "react";
import {
  Breadcrumbs,
  Link,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";

/**
 * Component for displaying and navigating folder breadcrumbs
 * 
 * @param {Object} props
 * @param {Array} props.folders - Hierarchical folder structure
 * @param {string|null} props.selectedFolderId - ID of currently selected folder
 * @param {Function} props.setSelectedFolderId - Function to update selected folder
 * @param {boolean} props.showAllFolders - Whether to show all folders view
 * @param {Function} props.setShowAllFolders - Function to toggle showing all folders
 * @param {Object} props.customIcons - Custom icons for different breadcrumb items
 * @param {React.ReactNode} props.customIcons.root - Icon for root folder
 * @param {React.ReactNode} props.customIcons.folder - Icon for regular folders
 * @param {React.ReactNode} props.customIcons.allFolders - Icon for all folders view
 */
const FolderBreadcrumbs = ({
  folders = [],
  selectedFolderId = null,
  setSelectedFolderId,
  showAllFolders = false,
  setShowAllFolders,
  customIcons
}) => {
  // Initialize the translation hook
  const { t } = useTranslate();
  
  // Process folders to create a flat structure for easier operations
  const [flatFolders, setFlatFolders] = useState([]);

  /**
   * Flatten the nested folder structure for easier navigation
   */
  useEffect(() => {
    const flattenedFolders = [];
    
    const flattenFolders = (folderArray, parentPath = []) => {
      folderArray.forEach(folder => {
        // Extract children before adding to flat list
        const { children, ...folderWithoutChildren } = folder;
        
        // Ensure parentId is null if undefined
        const normalizedFolder = {
          ...folderWithoutChildren,
          parentId: folderWithoutChildren.parentId === undefined ? null : folderWithoutChildren.parentId,
          path: [...parentPath]
        };
        
        flattenedFolders.push(normalizedFolder);
        
        // Process children recursively
        if (children && children.length > 0) {
          flattenFolders(children, [...parentPath, folder.id]);
        }
      });
    };
    
    flattenFolders(folders);
    setFlatFolders(flattenedFolders);
  }, [folders]);

  /**
   * Build breadcrumb path from selected folder to root
   * 
   * @returns {Array} Array of folder objects representing breadcrumb path
   */
  const buildBreadcrumbs = () => {
    if (!selectedFolderId) return [];
    
    const breadcrumbs = [];
    let currentFolderId = selectedFolderId;
    
    // Prevent infinite loops
    const maxDepth = 20;
    let depth = 0;
    
    while (currentFolderId && depth < maxDepth) {
      const folder = flatFolders.find((f) => f.id === currentFolderId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentFolderId = folder.parentId;
      } else {
        currentFolderId = null;
      }
      depth++;
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  /**
   * Handle clicking on a breadcrumb item
   * 
   * @param {string} folderId - ID of clicked folder
   * @param {Event} event - Click event
   */
  const handleBreadcrumbClick = (folderId, event) => {
    event.preventDefault();
    setSelectedFolderId(folderId);
  };

  /**
   * Navigate to root folder
   * 
   * @param {Event} event - Click event
   */
  const goToRoot = (event) => {
    event.preventDefault();
    setShowAllFolders(false);
    setSelectedFolderId(null);
  };

  /**
   * Switch to all folders view
   * 
   * @param {Event} event - Click event
   */
  const goToAllFolders = (event) => {
    event.preventDefault();
    setShowAllFolders(true);
    setSelectedFolderId(null);
  };

  /**
   * Get folder name with translation support
   * 
   * @param {Object} folder - Folder object
   * @returns {string} Translated folder name
   */
  const getFolderName = (folder) => {
    if (folder.translationKey) {
      return t(folder.translationKey);
    }
    return folder.name;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%',
        mb: 0
      }}
      role="navigation"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Tooltip title={t('explorer_view_all_folders')}>
          <Button
            variant={showAllFolders ? "contained" : "outlined"}
            startIcon={customIcons.allFolders}
            onClick={goToAllFolders}
            sx={{ mr: 2 }}
          >
            {t('explorer_all_folders')}
          </Button>
        </Tooltip>
        
        {!showAllFolders && (
          <Breadcrumbs 
            separator="›"
            sx={{ flexWrap: 'wrap' }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={goToRoot}
              sx={{ display: "flex", alignItems: "center" }}
              href="#"
            >
              <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                {customIcons.root}
              </Box>
              {t('explorer_root_folder')}
            </Link>
            
            {breadcrumbs.map((folder) => (
              <Link
                key={folder.id}
                underline="hover"
                color="inherit"
                onClick={(e) => handleBreadcrumbClick(folder.id, e)}
                sx={{ display: "flex", alignItems: "center" }}
                href="#"
              >
                <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                  {customIcons.folder}
                </Box>
                {getFolderName(folder)}
              </Link>
            ))}
          </Breadcrumbs>
        )}
      </Box>
    </Box>
  );
};

export default FolderBreadcrumbs;
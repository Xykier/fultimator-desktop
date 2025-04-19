import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Folder,
  FolderOpen,
  Home,
} from "@mui/icons-material";

const FolderExplorer = ({
  folders,
  selectedFolderId,
  setSelectedFolderId,
  setFolders,
}) => {
  const [openFolders, setOpenFolders] = useState({});
  
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
  }, [folders]);

  const getChildFolders = (folderId) => {
    return flatFolders.filter((folder) => folder.parentId === folderId);
  };

  const handleFolderClick = (folderId) => {
    setSelectedFolderId(folderId);
  };

  const handleToggle = (folderId) => {
    setOpenFolders((prevOpenFolders) => {
      const newOpenFolders = { ...prevOpenFolders };
      if (newOpenFolders[folderId]) {
        delete newOpenFolders[folderId];
      } else {
        newOpenFolders[folderId] = true;
      }
      return newOpenFolders;
    });
  };

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

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          underline="hover"
          color="inherit"
          onClick={() => handleBreadcrumbClick(null)}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          All NPCs
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
      <List disablePadding>
        {getChildFolders(null).map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            openFolders={openFolders}
            handleToggle={handleToggle}
            handleFolderClick={handleFolderClick}
            selectedFolderId={selectedFolderId}
            setSelectedFolderId={setSelectedFolderId}
            setFolders={setFolders}
            getChildFolders={getChildFolders}
          />
        ))}
      </List>
    </div>
  );
};

const FolderItem = ({
  folder,
  openFolders,
  handleToggle,
  handleFolderClick,
  selectedFolderId,
  setSelectedFolderId,
  setFolders,
  getChildFolders
}) => {
  const isSelected = folder.id === selectedFolderId;
  const isOpen = !!openFolders[folder.id];
  const hasChildren = getChildFolders(folder.id).length > 0;

  return (
    <>
      <ListItem
        button
        onClick={() => {
          handleFolderClick(folder.id);
          handleToggle(folder.id);
        }}
        sx={{ pl: 4, backgroundColor: isSelected ? "action.selected" : null }}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation(); // Prevent ListItem onClick from firing
            handleToggle(folder.id);
          }}
          aria-label="expand"
        >
          {hasChildren ? (
            isOpen ? (
              <ExpandLess />
            ) : (
              <ExpandMore />
            )
          ) : null}
        </IconButton>
        {isSelected ? <FolderOpen /> : <Folder />}
        <ListItemText primary={folder.name} />
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {getChildFolders(folder.id).map((childFolder) => (
            <FolderItem
              key={childFolder.id}
              folder={childFolder}
              openFolders={openFolders}
              handleToggle={handleToggle}
              handleFolderClick={handleFolderClick}
              selectedFolderId={selectedFolderId}
              setSelectedFolderId={setSelectedFolderId}
              setFolders={setFolders}
              getChildFolders={getChildFolders}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default FolderExplorer;
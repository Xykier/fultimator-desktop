import React, { useState, useEffect } from "react";
import { 
  Box, 
  Grid, 
  Typography, 
  Stack, 
  Toolbar, 
  Button, 
  Fade,
  Tooltip,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

import NpcCard from "./NpcCard";
import NpcListItem from "./NpcListItem";
import NpcsFolderHeader from "./NpcsFolderHeader";
import NpcMoveFolderDialog from "./NpcMoveFolderDialog";
import { useNpcFiltersStore } from "./stores/npcFiltersStore";
import { useNpcFoldersStore } from "./stores/npcFolderStore";
import { useNpcStore } from "./stores/npcDataStore";

const NpcList = ({
  campaignNpcs,
  expandedNpcId,
  handleExpandNpc,
  handleEditNpc,
  handleToggleNpc,
  handleSetAttitude,
}) => {
  const {unlinkMultipleNpcs} = useNpcStore();
  
  const { npcFilterType, selectedNpcFolderId, getDisplayedNpcs } =
    useNpcFiltersStore();

  const { npcFolders, prepareRenameFolder, prepareDeleteFolder, setIsNewFolderDialogOpen, moveNpcToFolder } =
    useNpcFoldersStore();

  // Initialize viewMode from localStorage or default to "grid"
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem("npcListViewMode");
    return savedViewMode || "grid"; // Default to 'grid' if no saved preference
  });

  // Add selection state
  const [selectedNpcs, setSelectedNpcs] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [moveFolderDialogOpen, setMoveFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  
  // Track previous folder ID to detect changes
  const [prevFolderId, setPrevFolderId] = useState(selectedNpcFolderId);

  // Update localStorage whenever viewMode changes
  useEffect(() => {
    localStorage.setItem("npcListViewMode", viewMode);
  }, [viewMode]);

  // Clear selection when folder changes
  useEffect(() => {
    if (prevFolderId !== selectedNpcFolderId) {
      setSelectedNpcs([]);
      setSelectionMode(false);
      setPrevFolderId(selectedNpcFolderId);
    }
  }, [selectedNpcFolderId, prevFolderId]);

  // Automatically enable selection mode when there are selected NPCs
  useEffect(() => {
    if (selectedNpcs.length > 0 && !selectionMode) {
      setSelectionMode(true);
    } else if (selectedNpcs.length === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedNpcs, selectionMode]);

  // Get displayed NPCs using the store's method
  const displayedNpcs = getDisplayedNpcs(campaignNpcs);

  // Find the selected folder object if a folder is selected
  const findFolder = (folders, selectedFolderId) => {
    if (!folders || !Array.isArray(folders)) {
      console.error("Invalid folders data:", folders);
      return null;
    }
    
    for (const folder of folders) {
      if (folder.id === selectedFolderId) {
        return folder;
      }
      if (folder.children && folder.children.length > 0) {
        const found = findFolder(folder.children, selectedFolderId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const currentFolder = selectedNpcFolderId
    ? findFolder(npcFolders, selectedNpcFolderId)
    : null;

  // Selection handlers
  const handleSelectNpc = (npcId, isSelected) => {
    if (isSelected) {
      setSelectedNpcs((prev) => [...prev, npcId]);
    } else {
      setSelectedNpcs((prev) => prev.filter((id) => id !== npcId));
    }
  };

  const handleSelectAll = () => {
    if (selectedNpcs.length === displayedNpcs.length) {
      // Deselect all if all are selected
      setSelectedNpcs([]);
    } else {
      // Select all displayed NPCs
      setSelectedNpcs(displayedNpcs.map((npc) => npc.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedNpcs([]);
    setSelectionMode(false);
  };

  const handleCreateFolder = (parentId) => {
    setIsNewFolderDialogOpen(true);
    // You might need to set the parent folder ID in your store
    console.log("handleCreateFolder", parentId);
  };

  // Batch actions for selected NPCs
  const handleBatchUnlink = () => {
    unlinkMultipleNpcs(selectedNpcs);
    setSelectedNpcs([]);
  };

  const handleMoveFolderOpen = () => {
    setMoveFolderDialogOpen(true);
  };

  const handleMoveFolderClose = () => {
    setMoveFolderDialogOpen(false);
    setSelectedFolder("");
  };

  const handleMoveToFolder = (folderId) => {
    selectedNpcs.forEach((npcId) => {
      moveNpcToFolder(npcId, folderId);
    });
    handleMoveFolderClose();
    setSelectedNpcs([]);
  };

  const handleFolderChange = (event) => {
    setSelectedFolder(event.target.value);
  };

  return (
    <Box sx={{ display: "flex", height: "100%", width: "100%" }}>       
      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Folder Header with breadcrumbs and actions */}
        <NpcsFolderHeader
          selectedFolder={currentFolder}
          onRenameFolder={prepareRenameFolder}
          onDeleteFolder={prepareDeleteFolder}
          onCreateFolder={handleCreateFolder}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onSelectAll={handleSelectAll}
        />

        {/* Selection Toolbar */}
        <Fade in={selectionMode}>
          <Toolbar
            variant="dense"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 1,
              mb: 2,
              display: selectionMode ? "flex" : "none",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                {selectedNpcs.length} selected
              </Typography>
              
              <Tooltip title={selectedNpcs.length === displayedNpcs.length ? "Deselect All" : "Select All"}>
                <IconButton 
                  size="small" 
                  onClick={handleSelectAll} 
                  color="inherit"
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                startIcon={<FolderIcon />}
                variant="outlined"
                color="inherit"
                onClick={handleMoveFolderOpen}
              >
                Move To Folder
              </Button>
              
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="inherit"
                onClick={handleBatchUnlink}
              >
                Unlink Selected
              </Button>
              
              <IconButton 
                size="small" 
                onClick={handleClearSelection} 
                color="inherit"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </Fade>

        {/* NPCs Content */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {displayedNpcs.length > 0 ? (
              viewMode === "grid" ? (
                <Grid container spacing={2}>
                  {displayedNpcs.map((npc) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={npc.id}>
                      <NpcCard
                        npc={npc}
                        expandedNpcId={expandedNpcId}
                        handleExpandNpc={handleExpandNpc}
                        onEdit={handleEditNpc}
                        onUnlink={handleToggleNpc}
                        onSetAttitude={handleSetAttitude}
                        folders={npcFolders}
                        onSelect={handleSelectNpc}
                        isSelected={selectedNpcs.includes(npc.id)}
                        selectionMode={selectionMode}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Stack spacing={1}>
                  {displayedNpcs.map((npc) => (
                    <NpcListItem
                      key={npc.id}
                      npc={npc}
                      expandedNpcId={expandedNpcId}
                      handleExpandNpc={handleExpandNpc}
                      onEdit={handleEditNpc}
                      onUnlink={handleToggleNpc}
                      onSetAttitude={handleSetAttitude}
                      folders={npcFolders}
                      onSelect={handleSelectNpc}
                      isSelected={selectedNpcs.includes(npc.id)}
                      selectionMode={selectionMode}
                    />
                  ))}
                </Stack>
              )
          ) : (
            // Empty state specific to the selected filter
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                mt: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {currentFolder
                  ? `No NPCs in folder "${currentFolder.name}"`
                  : npcFilterType === "all"
                  ? "No NPCs match the current search."
                  : npcFilterType === "friendly"
                  ? "No friendly NPCs found."
                  : npcFilterType === "neutral"
                  ? "No neutral NPCs found."
                  : npcFilterType === "hostile"
                  ? "No hostile NPCs found."
                  : "No villains found."}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Move Folder Dialog */}
      <NpcMoveFolderDialog
        open={moveFolderDialogOpen}
        onClose={handleMoveFolderClose}
        selectedFolder={selectedFolder}
        folders={npcFolders}
        handleFolderChange={handleFolderChange}
        handleMoveToFolder={handleMoveToFolder}
        currentFolderId={currentFolder?.id}
        title={`Move ${selectedNpcs.length} NPCs to folder`}
      />
    </Box>
  );
};

export default NpcList;
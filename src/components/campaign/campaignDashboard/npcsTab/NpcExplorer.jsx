import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import NpcCard from "./NpcCard";
import NpcListItem from "./NpcListItem";
import { useNpcFiltersStore } from "./stores/npcFiltersStore";
import { useNpcFoldersStore } from "./stores/npcFolderStore";
import { useNpcStore } from "./stores/npcDataStore";
import Explorer from "../../common/Explorer";

const NpcExplorer = ({ campaignNpcs, handleToggleNpc }) => {
  const { unlinkMultipleNpcs } = useNpcStore();
  const {
    selectedNpcFolderId,
    getDisplayedNpcs,
    setSelectedNpcFolderId,
    showAllFolders,
    setShowAllFolders,
  } = useNpcFiltersStore();
  const {
    npcFolders,
    prepareRenameFolder,
    prepareDeleteFolder,
    setIsNewFolderDialogOpen,
    moveNpcToFolder,
  } = useNpcFoldersStore();

  // Initialize viewMode from localStorage or default to "grid"
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem("npcListViewMode");
    return savedViewMode || "grid"; // Default to 'grid' if no saved preference
  });

  // Add selection state
  const [selectedNpcs, setSelectedNpcs] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

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

  return (
    <Explorer
      folders={npcFolders}
      selectedFolderId={selectedNpcFolderId}
      setSelectedFolderId={setSelectedNpcFolderId}
      showAllFolders={showAllFolders}
      setShowAllFolders={setShowAllFolders}
      viewMode={viewMode}
      setViewMode={setViewMode}
      items={displayedNpcs}
      setIsNewFolderDialogOpen={setIsNewFolderDialogOpen}
      moveItemToFolder={moveNpcToFolder}
      unlinkMultipleItems={unlinkMultipleNpcs}
      prepareRenameFolder={prepareRenameFolder}
      prepareDeleteFolder={prepareDeleteFolder}
      handleUnlinkItem={handleToggleNpc}
      ItemCardComponent={NpcCard}
      ItemListComponent={NpcListItem}
      EmptyListComponent={EmptyNpcsList}
    />
  );
};

const EmptyNpcsList = ({ currentFolder }) => {
  return (
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
          : "No NPCs match the current search."}
      </Typography>
    </Box>
  );
};

export default NpcExplorer;

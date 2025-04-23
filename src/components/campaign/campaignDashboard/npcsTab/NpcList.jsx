import React, { useState } from "react";
import { Box, Grid, Typography, Stack } from "@mui/material";

import NpcCard from "./NpcCard";
import NpcListItem from "./NpcListItem"; // We'll create this component
import NpcsFolderHeader from "./NpcsFolderHeader";
import { useNpcFiltersStore } from "./stores/npcFiltersStore";
import { useNpcFoldersStore } from "./stores/npcFolderStore";

const NpcList = ({
  campaignNpcs,
  expandedNpcId,
  handleExpandNpc,
  handleEditNpc,
  handleToggleNpc,
  handleSetAttitude,
}) => {
  // Use the Zustand store instead of the hook-based state
  const { npcFilterType, selectedNpcFolderId, getDisplayedNpcs } =
    useNpcFiltersStore();

  const { npcFolders, prepareRenameFolder, prepareDeleteFolder, setIsNewFolderDialogOpen } =
    useNpcFoldersStore();

  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

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

  const selectedFolder = selectedNpcFolderId
    ? findFolder(npcFolders, selectedNpcFolderId)
    : null;

  const handleCreateFolder = (parentId) => {
    setIsNewFolderDialogOpen(true);
    // You might need to set the parent folder ID in your store
    console.log("handleCreateFolder", parentId);
  };

  return (
        <Box sx={{ display: "flex", height: "100%", width: "100%" }}>       
          {/* Main Content */}
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Folder Header with breadcrumbs and actions */}
            <NpcsFolderHeader
              selectedFolder={selectedFolder}
              onRenameFolder={prepareRenameFolder}
              onDeleteFolder={prepareDeleteFolder}
              onCreateFolder={handleCreateFolder}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
            />

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
                    {selectedFolder
                      ? `No NPCs in folder "${selectedFolder.name}"`
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
        </Box>
  );
};

export default NpcList;
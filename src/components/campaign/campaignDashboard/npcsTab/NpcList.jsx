import React from "react";
import { Box, Grid, Typography } from "@mui/material";

import NpcCard from "./NpcCard";
import NpcsFolderHeader from "./NpcsFolderHeader";
import { useNpcFiltersStore } from "./stores/npcFiltersStore";

const NpcList = ({
  campaignNpcs,
  expandedNpcId,
  handleExpandNpc,
  handleEditNpc,
  handleToggleNpc,
  handleSetAttitude,
  folders,
  handleMoveNpcToFolder,  
  onRenameFolder,
  onDeleteFolder,
}) => {
  // Use the Zustand store instead of the hook-based state
  const {
    npcFilterType,
    selectedNpcFolderId,
    getDisplayedNpcs
  } = useNpcFiltersStore();

  // Get displayed NPCs using the store's method
  const displayedNpcs = getDisplayedNpcs(campaignNpcs);

  // Find the selected folder object if a folder is selected
  const findFolder = (folders, selectedFolderId) => {
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

  const selectedFolder = selectedNpcFolderId ? findFolder(folders, selectedNpcFolderId) : null;

  return (
    <>
      {/* Folder Header - only shown when a folder is selected */}
      {selectedFolder && (
        <Grid item xs={12}>
          <NpcsFolderHeader
            selectedFolder={selectedFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
          />
        </Grid>
      )}

      {displayedNpcs.length > 0 ? (
        displayedNpcs.map((npc) => (
          <NpcCard
            key={npc.id}
            npc={npc}
            expandedNpcId={expandedNpcId}
            handleExpandNpc={handleExpandNpc}
            onEdit={handleEditNpc}
            onUnlink={handleToggleNpc}
            onSetAttitude={handleSetAttitude}
            folders={folders}
            onMoveToFolder={handleMoveNpcToFolder}
          />
        ))
      ) : (
        // Empty state specific to the selected filter
        <Grid item xs={12}>
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
        </Grid>
      )}
    </>
  );
};

export default NpcList;

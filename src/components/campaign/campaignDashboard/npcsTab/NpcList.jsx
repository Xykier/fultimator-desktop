import React from "react";
import { Box, Grid, Typography } from "@mui/material";

import NpcCard from "./NpcCard";
import NpcsFolderHeader from "./NpcsFolderHeader";

const NpcList = ({
  displayedNpcs,
  expandedNpcId,
  handleExpandNpc,
  handleEditNpc,
  handleToggleNpc,
  handleSetAttitude,
  filterType,
  folders,
  handleMoveNpcToFolder,
  selectedFolderId,
  onRenameFolder,
  onDeleteFolder,
}) => {
  // Find the selected folder object if a folder is selected
  const selectedFolder = selectedFolderId
    ? folders.find((folder) => folder.id === selectedFolderId)
    : null;

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
                : filterType === "all"
                ? "No NPCs match the current search."
                : filterType === "friendly"
                ? "No friendly NPCs found."
                : filterType === "neutral"
                ? "No neutral NPCs found."
                : filterType === "hostile"
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

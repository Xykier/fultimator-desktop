import React from "react";
import {
  Grid,
  Box,
  Typography,
} from "@mui/material";

import NpcCard from "./NpcCard";

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
}) => {
  return (
    <>
      {displayedNpcs.length > 0 ? (
        displayedNpcs.map((npc) => (
          <NpcCard
            key={npc.id}
            npc={npc}
            expandedNpcId={expandedNpcId}
            handleExpandNpc={handleExpandNpc}
            onEdit={handleEditNpc} // Pass edit handler
            onUnlink={handleToggleNpc} // Pass unlink handler (uses toggle logic)
            onSetAttitude={handleSetAttitude} // Pass attitude handler
            folders={folders} // Pass folders
            onMoveToFolder={handleMoveNpcToFolder} // Pass move to folder handler
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
              {filterType === "all" && "No NPCs match the current search."}
              {filterType === "friendly" && "No friendly NPCs found."}
              {filterType === "neutral" && "No neutral NPCs found."}
              {filterType === "hostile" && "No hostile NPCs found."}
              {filterType === "villains" && "No villains found."}
            </Typography>
          </Box>
        </Grid>
      )}
    </>
  );
};

export default NpcList;
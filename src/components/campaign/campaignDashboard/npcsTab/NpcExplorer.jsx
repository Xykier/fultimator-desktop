import React, { useState } from "react";
import { Box, Drawer, useMediaQuery, Fab, Zoom, useTheme } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";

import NpcList from "./NpcList";
import NpcFolderSidebar from "./NpcFolderSidebar";

const NpcExplorer = ({
  campaignNpcs,
  expandedNpcId,
  handleExpandNpc,
  handleEditNpc,
  handleToggleNpc,
  handleSetAttitude,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleCreateFolder = (parentId) => {
    // Your create folder logic
    console.log("Creating folder with parent:", parentId);
    setDrawerOpen(false); // Close drawer on mobile after action
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        position: "relative",
        width: "100%",
        marginBottom: 1
      }}
    >
      {/* Folder sidebar - permanent on desktop, drawer on mobile */}
      {isMobile ? (
        <>
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={toggleDrawer}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
            }}
          >
            <NpcFolderSidebar onCreateFolder={handleCreateFolder} />
          </Drawer>

          <Zoom in={!drawerOpen}>
            <Fab
              color="primary"
              size="small"
              onClick={toggleDrawer}
              sx={{ position: "absolute", bottom: 16, left: 16, zIndex: 1 }}
            >
              <FolderIcon />
            </Fab>
          </Zoom>
        </>
      ) : (
        <Box sx={{ width: 240, flexShrink: 0, mr: 2 }}>
          <NpcFolderSidebar onCreateFolder={handleCreateFolder} />
        </Box>
      )}

      {/* Main content */}
      <Box
        sx={{
          flexGrow: 1,
          width: isMobile ? "100%" : "calc(100% - 260px)",
          overflow: "hidden",
        }}
      >
        <NpcList
          campaignNpcs={campaignNpcs}
          expandedNpcId={expandedNpcId}
          handleExpandNpc={handleExpandNpc}
          handleEditNpc={handleEditNpc}
          handleToggleNpc={handleToggleNpc}
          handleSetAttitude={handleSetAttitude}
        />
      </Box>
    </Box>
  );
};

export default NpcExplorer;

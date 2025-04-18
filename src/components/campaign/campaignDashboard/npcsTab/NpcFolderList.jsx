import React from "react";
import { Box, Chip, useTheme, useMediaQuery } from "@mui/material";
import { Folder } from "@mui/icons-material";

const NpcFolderList = ({ folders, selectedFolderId, setSelectedFolderId }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          flexWrap: "wrap",
          gap: 1,
          width: "100%",
        }}
      >
        <Chip
          label="All NPCs"
          icon={<Folder fontSize="small" />}
          onClick={() => setSelectedFolderId(null)}
          color={selectedFolderId === null ? "primary" : "default"}
          variant={selectedFolderId === null ? "filled" : "outlined"}
          sx={{
            fontWeight: selectedFolderId === null ? 500 : 400,
            width: isSmallScreen ? "100%" : "auto",
            "&:hover": {
              backgroundColor:
                selectedFolderId === null
                  ? theme.palette.primary.main
                  : theme.palette.action.hover,
            },
          }}
        />

        {folders.map((folder) => (
          <Chip
            key={folder.id}
            label={folder.name}
            icon={<Folder fontSize="small" />}
            onClick={() => setSelectedFolderId(folder.id)}
            color={selectedFolderId === folder.id ? "primary" : "default"}
            variant={selectedFolderId === folder.id ? "filled" : "outlined"}
            sx={{
              fontWeight: selectedFolderId === folder.id ? 500 : 400,
              width: isSmallScreen ? "100%" : "auto",
              "&:hover": {
                backgroundColor:
                  selectedFolderId === folder.id
                    ? theme.palette.primary.main
                    : theme.palette.action.hover,
              },
              "& .MuiChip-deleteIcon": {
                color:
                  selectedFolderId === folder.id
                    ? "white"
                    : theme.palette.error.main,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default NpcFolderList;

import React from "react";
import { Typography, Box, Button, TextField, Icon } from "@mui/material";
import { Edit } from "@mui/icons-material";

export default function BattleHeader({
  encounterName,
  isEditing,
  handleEditClick,
  handleEncounterNameChange,
  handleBlur,
  handleKeyPress,
  handleSaveState,
  timeAgo,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: "#fff",
        padding: 2,
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {isEditing ? (
          <TextField
            value={encounterName}
            onChange={handleEncounterNameChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyPress}
            autoFocus
            variant="standard"
            error={encounterName.trim() === ""}
            helperText={encounterName.trim() === "" ? "Name cannot be empty" : ""}
          />
        ) : (
          <>
            <Typography
              variant="h4"
              onClick={handleEditClick}
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {encounterName}
            </Typography>
            <Icon onClick={handleEditClick} sx={{ cursor: "pointer" }}>
              <Edit />
            </Icon>
          </>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {timeAgo !== "Not saved yet" && (
          <Typography variant="body2">Last saved: {timeAgo}</Typography>
        )}
        <Button variant="contained" color="primary" onClick={handleSaveState}>
          Save
        </Button>
      </Box>
    </Box>
  );
}

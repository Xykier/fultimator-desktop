import React from "react";
import { Typography, Box, Button, TextField, Icon, IconButton } from "@mui/material";
import { Edit, ArrowRight, ArrowLeft } from "@mui/icons-material";

export default function BattleHeader({
  encounterName,
  isEditing,
  handleEditClick,
  handleEncounterNameChange,
  handleBlur,
  handleKeyPress,
  handleSaveState,
  timeAgo,
  round,
  handleIncreaseRound,
  handleDecreaseRound,
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

      {/* Center Section for Round */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
        <IconButton
          onClick={handleDecreaseRound}
          color="primary"
          sx={{ padding: 1 }}
        >
          <ArrowLeft fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ marginX: 2 }}>
          {`Round ${round}`}
        </Typography>
        <IconButton
          onClick={handleIncreaseRound}
          color="primary"
          sx={{ padding: 1 }}
        >
          <ArrowRight fontSize="small" />
        </IconButton>
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

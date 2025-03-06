import React from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  Icon,
  IconButton,
} from "@mui/material";
import { Edit, ArrowRight, ArrowLeft, Save } from "@mui/icons-material";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

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
  isMobile,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: isDarkMode ? "#333333" : "#ffffff",
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
            helperText={
              encounterName.trim() === ""
                ? t("combat_sim_empty_name_warning")
                : ""
            }
            inputProps={{ maxLength: 100 }}
          />
        ) : (
          <>
            <Typography
              variant={isMobile ? "h6" : "h4"}
              onClick={handleEditClick}
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {encounterName}
            </Typography>
            <Icon onClick={handleEditClick} sx={{ cursor: "pointer" }}>
              <Edit fontSize={isMobile ? "small" : "medium"} />
            </Icon>
          </>
        )}
      </Box>

      {/* Center Section for Round */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <IconButton
          onClick={handleDecreaseRound}
          color={isDarkMode ? "#fff" : "primary"}
          sx={{ padding: 1 }}
        >
          <ArrowLeft fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <Typography
          variant={isMobile ? "h6" : "h3"}
          sx={{ marginX: 2, textTransform: "uppercase" }}
        >
          {t("combat_sim_round") + `: ${round}`}
        </Typography>
        <IconButton
          onClick={handleIncreaseRound}
          color={isDarkMode ? "#fff" : "primary"}
          sx={{ padding: 1 }}
        >
          <ArrowRight fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {timeAgo !== "Not saved yet" && !isMobile && (
          <Typography variant="body2">{timeAgo}</Typography>
        )}
        {isMobile ? (
          <IconButton
            onClick={handleSaveState}
            color="white"
            sx={{
              backgroundColor: "primary.main",
              margin: 0,
            }}
          >
            <Save fontSize="small" />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveState}
            startIcon={<Save />}
            sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
          >
            {t("combat_sim_save")}
          </Button>
        )}
      </Box>
    </Box>
  );
}

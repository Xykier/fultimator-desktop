import React, { useState } from "react";
import {
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Typography,
  Paper,
  Box,
  Slider,
  Tooltip,
  Divider,
} from "@mui/material";
import RemoveCircleOutline from "@mui/icons-material/RemoveCircleOutline";
import Clock from "../playerSheet/Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function NoteClocksManager({
  isEditMode,
  note,
  noteIndex,
  setPlayer,
  t,
  theme,
}) {
  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);
  const [previewState, setPreviewState] = useState(
    new Array(clockSections).fill(false)
  );

  const handleAddClock = () => {
    setClockDialogOpen(true);
    setClockName("");
    setClockSections(4);
    setPreviewState(new Array(4).fill(false));
  };

  const handleCloseClockDialog = () => {
    setClockDialogOpen(false);
  };

  const handleSectionChange = (event, newValue) => {
    setClockSections(newValue);
    setPreviewState(new Array(newValue).fill(false));
  };

  const handleConfirmClock = () => {
    if (!clockName.trim()) {
      if (window.electron) {
        window.electron.alert(t("Clock name is required."));
      } else {
        alert(t("Clock name is required."));
      }
      return;
    }

    setPlayer((prevState) => {
      const newState = { ...prevState };
      if (!newState.notes[noteIndex].clocks) {
        newState.notes[noteIndex].clocks = [];
      }
      newState.notes[noteIndex].clocks.push({
        name: clockName,
        sections: clockSections,
        state: new Array(clockSections).fill(false),
      });
      return newState;
    });
    handleCloseClockDialog();
  };

  const handleRemoveClock = (clockIndex) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[noteIndex].clocks.splice(clockIndex, 1);
      return newState;
    });
  };

  const handleClockStateChange = (clockIndex, newState) => {
    setPlayer((prevState) => {
      const newPlayerState = { ...prevState };
      newPlayerState.notes[noteIndex].clocks[clockIndex].state = newState;
      return newPlayerState;
    });
  };

  const resetClockState = (noteIndex, clockIndex) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      const sections = newState.notes[noteIndex].clocks[clockIndex].sections;
      newState.notes[noteIndex].clocks[clockIndex].state = new Array(
        sections
      ).fill(false);
      return newState;
    });
  };

  return (
    <>
      {isEditMode && (
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddClock}
            disabled={note.clocks && note.clocks.length >= 4}
            startIcon={
              <Box component="span" sx={{ fontSize: "1.5rem" }}>
                ⏱️
              </Box>
            }
            sx={{ fontWeight: "bold" }}
          >
            {t("Add Progress Clock")}
          </Button>
          {note.clocks && note.clocks.length >= 4 && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1,
                color: theme.palette.text.secondary,
              }}
            >
              {t("Maximum of 4 clocks per note reached")}
            </Typography>
          )}
        </Grid>
      )}

      {note.clocks && note.clocks.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
            {t("Progress Clocks")}
          </Typography>
          <Grid container spacing={3}>
            {note.clocks.map((clock, clockIndex) => (
              <Grid item xs={12} sm={6} md={3} key={clockIndex}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: "100%",
                    position: "relative",
                  }}
                >
                  {isEditMode && (
                    <Tooltip title={t("Remove")}>
                      <IconButton
                        onClick={() => handleRemoveClock(clockIndex)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          color: theme.palette.error.main,
                        }}
                        size="small"
                      >
                        <RemoveCircleOutline />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Box sx={{ textAlign: "center", pb: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "bold",
                        mb: 0.5,
                        maxWidth: "calc(100% - 40px)",
                        mx: "auto",
                      }}
                    >
                      {clock.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {t("Sections")}:{" "}
                      {clock.state.filter((state) => state).length}/
                      {clock.sections}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <Clock
                      numSections={clock.sections}
                      size={140}
                      state={clock.state}
                      setState={(newState) =>
                        handleClockStateChange(clockIndex, newState)
                      }
                      isCharacterSheet={false}
                    />
                  </Box>
                  {isEditMode && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <Tooltip title={`${t("Reset")} ${clock.name}`} arrow>
                        <IconButton
                          color={
                            theme.palette.mode === "dark" ? "#fff" : "primary"
                          }
                          onClick={() => resetClockState(noteIndex, clockIndex)}
                          sx={{
                            bgcolor: "background.default",
                            "&:hover": {
                              bgcolor: "action.selected",
                            },
                          }}
                          size="small"
                        >
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}

      {/* Improved Clock Dialog */}
      <Dialog
        open={clockDialogOpen}
        onClose={handleCloseClockDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          variant="h3"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
            {t("Add Progress Clock")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="normal"
                id="clockName"
                label={t("Clock Name")}
                type="text"
                fullWidth
                variant="outlined"
                value={clockName}
                onChange={(e) => setClockName(e.target.value)}
                inputProps={{ maxLength: 30 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", mr: 1 }}
                  >
                    {t("Clock Sections")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Slider
                    value={clockSections}
                    onChange={handleSectionChange}
                    step={1}
                    marks
                    min={2}
                    max={30}
                    valueLabelDisplay="auto"
                    sx={{ flexGrow: 1, mr: 2 }}
                  />
                  <Typography variant="body2">{clockSections}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, textAlign: "center", fontWeight: "medium" }}
              >
                {t("Preview")}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Clock
                  numSections={clockSections}
                  size={180}
                  state={previewState}
                  setState={setPreviewState}
                  isCharacterSheet={false}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mt: 1,
                  color: theme.palette.text.secondary,
                }}
              >
                {t("Click sections to see how the clock works")}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Button
            onClick={handleCloseClockDialog}
            color="secondary"
            variant="contained"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleConfirmClock}
            color="primary"
            variant="contained"
            disabled={!clockName.trim()}
          >
            {t("Add Clock")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

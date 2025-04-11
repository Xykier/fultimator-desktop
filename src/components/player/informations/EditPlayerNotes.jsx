import React, { useState } from "react";
import {
  Divider,
  Grid,
  IconButton,
  TextField,
  useTheme,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Tooltip,
  FormControlLabel,
  Switch
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import RemoveCircleOutline from "@mui/icons-material/RemoveCircleOutline";
import { Add, Close, Edit, Save } from "@mui/icons-material";
import { globalConfirm } from "../../../utility/globalConfirm";
import MarkdownEditor from "../../common/MarkdownEditor";
import NotesMarkdown from "../../common/NotesMarkdown";

export default function EditPlayerNotes({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);

  // New states for markdown editor dialog
  const [editedMarkdown, setEditedMarkdown] = useState(null);
  const [editorDialogOpen, setEditorDialogOpen] = useState(false);
  const [currentEditingNote, setCurrentEditingNote] = useState(null);

  const handleNoteNameChange = (key) => (e) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[key].name = e.target.value;
      return newState;
    });
  };

  const handleMarkdownChange = (newMarkdown) => {
    if (currentEditingNote !== null) {
      setEditedMarkdown(newMarkdown);
    }
  };

  const openMarkdownEditor = (index) => {
    setCurrentEditingNote(index);
    setEditorDialogOpen(true);
    setEditedMarkdown(player.notes[index].description);
  };

  const saveMarkdown = () => {
    if (currentEditingNote !== null) {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.notes[currentEditingNote].description = editedMarkdown;
        return newState;
      });
    }
    closeMarkdownEditor(); // Now close the dialog after saving
  };

  const closeMarkdownEditor = () => {
    setEditorDialogOpen(false); // Close the dialog after saving
    setCurrentEditingNote(null); // Reset current editing note
    setEditedMarkdown(null); // Reset edited markdown
  };

  const removeItem = (key) => async () => {
    const confirmDelete = await globalConfirm(
      t("Are you sure you want to delete this note?")
    );
    if (confirmDelete) {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.notes.splice(key, 1);
        return newState;
      });
    }
  };

  const handleAddClock = (index) => {
    setSelectedNoteIndex(index);
    setClockDialogOpen(true);
  };

  const handleCloseClockDialog = () => {
    setClockDialogOpen(false);
    setSelectedNoteIndex(null);
    setClockName("");
    setClockSections(4);
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

    if (clockSections < 2 || clockSections > 30) {
      if (window.electron) {
        window.electron.alert(t("Sections must be between 2 and 30."));
      } else {
        alert(t("Sections must be between 2 and 30."));
      }
      return;
    }

    setPlayer((prevState) => {
      const newState = { ...prevState };
      if (!newState.notes[selectedNoteIndex].clocks) {
        newState.notes[selectedNoteIndex].clocks = [];
      }
      newState.notes[selectedNoteIndex].clocks.push({
        name: clockName,
        sections: clockSections,
        state: new Array(clockSections).fill(false),
      });
      return newState;
    });
    handleCloseClockDialog();
  };

  const handleRemoveClock = (noteIndex, clockIndex) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[noteIndex].clocks.splice(clockIndex, 1);
      return newState;
    });
  };

  const handleToggleShowInSheet = (index) => (e) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[index].showInPlayerSheet = e.target.checked;
      return newState;
    });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Notes")}
            addItem={
              isEditMode
                ? () => {
                    setPlayer((prevState) => {
                      const newState = { ...prevState };
                      newState.notes.push({
                        name: "",
                        description: "",
                        clocks: [],
                        showInPlayerSheet: true,
                      });
                      return newState;
                    });
                  }
                : null
            }
            showIconButton={isEditMode}
            icon={Add}
          />
        </Grid>
        {player.notes.map((note, index) => (
          <Grid container spacing={1} sx={{ py: 1 }} key={index}>
            {isEditMode && (
              <Grid
                item
                xs={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 0,
                  m: 0,
                }}
              >
                <Tooltip title={t("Delete")}>
                  <IconButton
                    onClick={removeItem(index)}
                    size="small"
                    sx={{
                      color: theme.palette.error.main,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            <Grid item xs={isEditMode ? 11 : 12}>
              <TextField
                id="name"
                label={t("Note Name") + ":"}
                value={note.name}
                onChange={handleNoteNameChange(index)}
                inputProps={{ maxLength: 50 }}
                InputProps={{
                  readOnly: !isEditMode,
                }}
                sx={{
                  width: "100%",
                }}
              />
            </Grid>
            <Grid item xs={12}>
              {/* Markdown display box and edit button */}
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: theme.palette.divider,
                  borderRadius: 1,
                  p: 2,
                  mt: 1,
                  position: "relative",
                  minHeight: "100px",
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Box sx={{ maxHeight: "300px", overflow: "auto" }}>
                  {note.description ? (
                    <NotesMarkdown>{note.description}</NotesMarkdown>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      {t("No content")}
                    </Typography>
                  )}
                </Box>
                {isEditMode && (
                  <Tooltip title={t("Edit")} placement="top">
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        borderRadius: 0,
                        color: "#fff",
                        backgroundColor: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                      onClick={() => openMarkdownEditor(index)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            {isEditMode && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => handleAddClock(index)}
                  disabled={note.clocks && note.clocks.length >= 4}
                >
                  {t("Add Clock")}
                </Button>
              </Grid>
            )}
            {note.clocks &&
              note.clocks.map((clock, clockIndex) => (
                <Grid item xs={12} sm={6} md={4} key={clockIndex}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      py: 1,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Grid item xs={10}>
                      <Typography variant="body2">
                        <strong style={{ fontSize: "1.4em" }}>
                          {clock.name}
                        </strong>{" "}
                        ({t("Clock Sections")}: {clock.sections})
                      </Typography>
                    </Grid>
                    {isEditMode && (
                      <Grid item xs={2}>
                        <IconButton
                          onClick={() => handleRemoveClock(index, clockIndex)}
                          sx={{
                            color: theme.palette.error.main,
                          }}
                        >
                          <RemoveCircleOutline />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              ))}
                                {isEditMode && (
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={note.showInPlayerSheet ?? true}
                            onChange={handleToggleShowInSheet(index)}
                          />
                        }
                        label={t("Show in Player Sheet")}
                      />
                    </Grid>
                  )}
            {index !== player.notes.length - 1 && (
              <Grid item xs={12}>
                <Divider />
              </Grid>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Clock Dialog */}
      <Dialog open={clockDialogOpen} onClose={handleCloseClockDialog}>
        <DialogTitle variant="h3">{t("Add Clock")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Enter the clock details below:")}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="clockName"
            label={t("Clock Name")}
            type="text"
            fullWidth
            variant="outlined"
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            inputProps={{ maxLength: 30 }}
          />
          <TextField
            margin="dense"
            id="clockSections"
            label={t("Clock Sections")}
            type="number"
            fullWidth
            variant="outlined"
            value={clockSections}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setClockSections(value);
            }}
            inputProps={{ min: 2, max: 30 }}
          />
        </DialogContent>
        <DialogActions>
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
          >
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Markdown Editor Dialog */}
      <Dialog fullScreen open={editorDialogOpen} onClose={closeMarkdownEditor}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={closeMarkdownEditor}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h4" component="div">
              {currentEditingNote !== null && player.notes[currentEditingNote]
                ? `${t("Edit")}: ${player.notes[currentEditingNote].name}`
                : t("Edit Note")}
            </Typography>
            <Button
              startIcon={<Save />}
              color="inherit"
              variant="outlined"
              onClick={saveMarkdown}
            >
              {t("Save")}
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
          {currentEditingNote !== null && (
            <MarkdownEditor
              initialValue={player.notes[currentEditingNote].description || ""}
              onChange={handleMarkdownChange}
            />
          )}
        </Box>
      </Dialog>
    </Paper>
  );
}

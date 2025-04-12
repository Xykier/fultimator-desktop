import React, { useState } from "react";
import {
  Divider,
  Grid,
  IconButton,
  TextField,
  useTheme,
  Paper,
  Typography,
  Box,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import {
  MoreVert,
  Add,
  Edit,
  Delete,
  ArrowUpward,
  ArrowDownward,
  ExpandMore,
  ExpandLess,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { globalConfirm } from "../../../utility/globalConfirm";
import NotesMarkdown from "../../common/NotesMarkdown";
import MarkdownEditDialog from "./MarkdownEditDialog";
import NoteClocksManager from "./NoteClocksManager";

export default function EditPlayerNotes({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  // State for markdown editor dialog
  const [editorDialogOpen, setEditorDialogOpen] = useState(false);
  const [currentEditingNote, setCurrentEditingNote] = useState(null);
  const [editedMarkdown, setEditedMarkdown] = useState(null);

  // State for expanded notes
  const [expandedNotes, setExpandedNotes] = useState({});

  // State for note menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeNoteIndex, setActiveNoteIndex] = useState(null);

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
    closeMarkdownEditor();
  };

  const closeMarkdownEditor = () => {
    setEditorDialogOpen(false);
    setCurrentEditingNote(null);
    setEditedMarkdown(null);
  };

  const removeItem = async (key) => {
    const noteName = player.notes[key].name || t("Unnamed Note");
    const confirmDelete = await globalConfirm(
      t(`Are you sure you want to delete the note "${noteName}"?`)
    );
    if (confirmDelete) {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.notes.splice(key, 1);
        return newState;
      });
    }
  };

  const handleToggleShowInSheet = (index) => (e) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[index].showInPlayerSheet = e.target.checked;
      return newState;
    });
  };

  const addNewNote = () => {
    const newNote = {
      name: "",
      description: "",
      clocks: [],
      showInPlayerSheet: true,
    };

    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes.push(newNote);
      return newState;
    });

    // Automatically expand the new note
    setTimeout(() => {
      const newIndex = player.notes.length;
      toggleExpandNote(newIndex);
    }, 100);
  };

  const moveNoteUp = (index) => {
    if (index === 0) return;

    setPlayer((prevState) => {
      const newState = { ...prevState };
      const notes = [...newState.notes];
      [notes[index - 1], notes[index]] = [notes[index], notes[index - 1]];
      newState.notes = notes;
      return newState;
    });
  };

  const moveNoteDown = (index) => {
    if (index === player.notes.length - 1) return;

    setPlayer((prevState) => {
      const newState = { ...prevState };
      const notes = [...newState.notes];
      [notes[index], notes[index + 1]] = [notes[index + 1], notes[index]];
      newState.notes = notes;
      return newState;
    });
  };

  // Menu handling
  const openNoteMenu = (event, index) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveNoteIndex(index);
  };

  const closeNoteMenu = () => {
    setMenuAnchorEl(null);
    setActiveNoteIndex(null);
  };

  const handleMenuAction = (action) => {
    if (activeNoteIndex === null) return;

    switch (action) {
      case "edit":
        openMarkdownEditor(activeNoteIndex);
        break;
      case "delete":
        removeItem(activeNoteIndex);
        break;
      case "moveUp":
        moveNoteUp(activeNoteIndex);
        break;
      case "moveDown":
        moveNoteDown(activeNoteIndex);
        break;
      case "toggleVisibility":
        handleToggleShowInSheet(activeNoteIndex)({
          target: {
            checked: !player.notes[activeNoteIndex].showInPlayerSheet,
          },
        });
        break;
      default:
        break;
    }

    closeNoteMenu();
  };

  // Toggle note expansion
  const toggleExpandNote = (index) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
            addItem={isEditMode ? addNewNote : null}
            showIconButton={isEditMode}
            icon={Add}
          />
        </Grid>

        {player.notes.length === 0 ? (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Paper
              sx={{ p: 3, textAlign: "center", bgcolor: "background.default" }}
            >
              <Typography variant="body1" color="text.secondary" sx={{fontStyle: "italic"}}>
                {t("No notes yet. Click the + button to add your first note.")}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          player.notes.map((note, index) => (
            <Grid item xs={12} key={index} sx={{ mt: index > 0 ? 2 : 1 }}>
              <Fade in={true} timeout={300}>
                <Card
                  elevation={1}
                  sx={{
                    transition: "all 0.3s ease",
                    borderLeft: note.showInPlayerSheet
                      ? `4px solid ${theme.palette.primary.main}`
                      : `4px solid ${theme.palette.grey[500]}`,
                    opacity: !isEditMode && !note.showInPlayerSheet ? 0.7 : 1,
                  }}
                >
                  <CardHeader
                    sx={{
                      cursor: "pointer",
                      py: 1,
                      bgcolor: expandedNotes[index]
                        ? theme.palette.action.selected
                        : "transparent",
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                    onClick={() => toggleExpandNote(index)}
                    title={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {!isEditMode ? (
                          <Typography variant="h6">
                            {note.name || t("Unnamed Note")}
                          </Typography>
                        ) : (
                          <TextField
                            id={`note-name-${index}`}
                            value={note.name}
                            onChange={handleNoteNameChange(index)}
                            placeholder={t("Note Name")}
                            onClick={(e) => e.stopPropagation()}
                            inputProps={{ maxLength: 50 }}
                            variant="standard"
                            fullWidth
                            sx={{ fontSize: "1.25rem" }}
                          />
                        )}
                        {!note.showInPlayerSheet && (
                          <Tooltip title={t("Hidden from Player Sheet")}>
                            <VisibilityOff
                              sx={{
                                ml: 1,
                                color: theme.palette.text.disabled,
                                fontSize: "0.9rem",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    action={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {expandedNotes[index] ? <ExpandLess /> : <ExpandMore />}

                        {isEditMode && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openNoteMenu(e, index);
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    }
                  />

                  <Collapse in={expandedNotes[index]}>
                    <CardContent>
                      <Box
                        sx={{
                          border: "1px solid",
                          borderColor: theme.palette.divider,
                          borderRadius: 1,
                          p: 2,
                          mb: 2,
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
                                color: "#fff",
                                backgroundColor: theme.palette.primary.main,
                                "&:hover": {
                                  backgroundColor: theme.palette.primary.dark,
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openMarkdownEditor(index);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>

                      {/* Clock management section */}
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <NoteClocksManager
                          isEditMode={isEditMode}
                          note={note}
                          noteIndex={index}
                          setPlayer={setPlayer}
                          t={t}
                          theme={theme}
                        />
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              </Fade>
              {index !== player.notes.length - 1 && !expandedNotes[index] && (
                <Divider sx={{ mt: 2 }} />
              )}
            </Grid>
          ))
        )}
      </Grid>

      {/* Note Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeNoteMenu}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => handleMenuAction("edit")}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          {t("Edit Content")}
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction("toggleVisibility")}
          disabled={activeNoteIndex === null}
        >
          {activeNoteIndex !== null &&
          player.notes[activeNoteIndex]?.showInPlayerSheet ? (
            <>
              <VisibilityOff fontSize="small" sx={{ mr: 1 }} />
              {t("Hide from Player Sheet")}
            </>
          ) : (
            <>
              <Visibility fontSize="small" sx={{ mr: 1 }} />
              {t("Show in Player Sheet")}
            </>
          )}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleMenuAction("moveUp")}
          disabled={activeNoteIndex === 0 || activeNoteIndex === null}
        >
          <ArrowUpward fontSize="small" sx={{ mr: 1 }} />
          {t("Move Up")}
        </MenuItem>
        <MenuItem
          onClick={() => handleMenuAction("moveDown")}
          disabled={
            activeNoteIndex === player.notes.length - 1 ||
            activeNoteIndex === null
          }
        >
          <ArrowDownward fontSize="small" sx={{ mr: 1 }} />
          {t("Move Down")}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleMenuAction("delete")}
          sx={{ color: theme.palette.error.main }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          {t("Delete Note")}
        </MenuItem>
      </Menu>

      {/* Markdown Editor Dialog */}
      <MarkdownEditDialog
        open={editorDialogOpen}
        onClose={closeMarkdownEditor}
        onSave={saveMarkdown}
        onChange={handleMarkdownChange}
        initialValue={
          currentEditingNote !== null
            ? player.notes[currentEditingNote]?.description || ""
            : ""
        }
        title={
          currentEditingNote !== null && player.notes[currentEditingNote]
            ? `${t("Edit")}: ${
                player.notes[currentEditingNote].name || t("Unnamed Note")
              }`
            : t("Edit Note")
        }
        t={t}
      />
    </Paper>
  );
}

import React, { Fragment } from "react";
import {
  Paper,
  Grid,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  Box,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import NotesMarkdown from "../../common/NotesMarkdown";
import Clock from "./Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function PlayerNotes({ player, setPlayer, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const secondary = theme.palette.secondary.main;

  const handleClockStateChange = (noteIndex, clockIndex, newState) => {
    setPlayer((prevPlayer) => {
      const updatedNotes = prevPlayer.notes.map((note, index) => {
        if (index === noteIndex) {
          const updatedClocks = note.clocks.map((clock, cIndex) => {
            if (cIndex === clockIndex) {
              return { ...clock, state: newState };
            }
            return clock;
          });
          return { ...note, clocks: updatedClocks };
        }
        return note;
      });
      return { ...prevPlayer, notes: updatedNotes };
    });
  };

  const resetClockState = (noteIndex, clockIndex) => {
    const resetState = new Array(
      player.notes[noteIndex].clocks[clockIndex].sections
    ).fill(false);
    handleClockStateChange(noteIndex, clockIndex, resetState);
  };

  return (
    <>
      {player.notes.filter((note) => note.showInPlayerSheet !== false).length >
        0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={2}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              overflow: "hidden",
              boxShadow:  isCharacterSheet ? "none" : 1,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                textTransform: "uppercase",
                padding: "5px",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                fontSize: "1.5em",
              }}
              align="center"
            >
              {t("Notes")}
            </Typography>

            <Box sx={{ p: { xs: 1, sm: 2 } }}>
              {player.notes
                .filter((note) => note.showInPlayerSheet !== false)
                .map((note, noteIndex) => (
                  <Fragment key={noteIndex}>
                    <Box
                      sx={{
                        mb: 4,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                        boxShadow: isCharacterSheet ? "none" : 1,
                      }}
                    >
                      {note.name && (
                        <Typography
                          variant="subtitle1"
                          sx={{
                            mb: 2,
                            fontWeight: "bold",
                            color: "text.secondary",
                          }}
                        >
                          {note.name}
                        </Typography>
                      )}

                      <NotesMarkdown
                        sx={{
                          fontFamily: "PT Sans Narrow",
                          fontSize: "1rem",
                          lineHeight: 1.6,
                          "& p": { mb: 1.5 },
                        }}
                      >
                        {note.description}
                      </NotesMarkdown>

                      {note.clocks && (
                        <Grid
                          container
                          spacing={3}
                          sx={{ mt: 2, justifyContent: "center" }}
                        >
                          {note.clocks.map((clock, clockIndex) => (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={3}
                              key={clockIndex}
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Stack
                                alignItems="center"
                                sx={{ position: "relative" }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 1,
                                    textAlign: "center",
                                    fontWeight: "medium",
                                    color: "text.secondary",
                                  }}
                                >
                                  {clock.name}
                                </Typography>
                                <Clock
                                  isCharacterSheet={isCharacterSheet}
                                  numSections={clock.sections}
                                  size={isSmallScreen ? 140 : 180}
                                  state={clock.state}
                                  setState={(newState) =>
                                    handleClockStateChange(
                                      noteIndex,
                                      clockIndex,
                                      newState
                                    )
                                  }
                                />
                                {!isCharacterSheet && (
                                  <Tooltip
                                    title={`${t("Reset")} ${clock.name}`}
                                    arrow
                                  >
                                    <IconButton
                                      color="primary"
                                      onClick={() =>
                                        resetClockState(noteIndex, clockIndex)
                                      }
                                      sx={{
                                        mt: 1,
                                        bgcolor: "background.default",
                                        "&:hover": {
                                          bgcolor: "action.selected",
                                        },
                                      }}
                                    >
                                      <RestartAltIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>

                    {noteIndex <
                      player.notes.filter(
                        (note) => note.showInPlayerSheet !== false
                      ).length -
                        1 && <Divider sx={{ my: 2 }} />}
                  </Fragment>
                ))}
            </Box>
          </Paper>
        </>
      )}
    </>
  );
}

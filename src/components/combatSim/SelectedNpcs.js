// SelectedNpcs.js

import React from "react";
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Tooltip, Button, Checkbox, Popover } from "@mui/material";
import { Replay, ArrowUpward, ArrowDownward, Delete } from "@mui/icons-material";
import {calcHP, calcMP} from "../../libs/npcs";

export default function SelectedNpcs({
  selectedNPCs,
  handleResetTurns,
  handleMoveUp,
  handleMoveDown,
  handleRemoveNPC,
  handleUpdateNpcTurns,
  handlePopoverOpen,
  handlePopoverClose,
  anchorEl,
  popoverNpcId,
  getTurnCount,
    handleNpcClick,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "#fff",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          borderBottom: "1px solid #ccc",
          paddingBottom: 1,
        }}
      >
        <Typography variant="h5">Selected NPCs</Typography>
        <Tooltip title="Reset Turns & Go to Next Round">
          <IconButton
            size="small"
            sx={{ padding: 0 }}
            color="primary"
            onClick={handleResetTurns}
          >
            <Replay />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
        {selectedNPCs.length === 0 ? (
          <Typography>No NPC selected</Typography>
        ) : (
          <List>
            {selectedNPCs.map((npc, index) => {
              const turnCount = getTurnCount(npc.rank);

              if (!npc.combatStats.turns) {
                npc.combatStats.turns = new Array(turnCount).fill(false);
              }

              const handleListItemClick = (e, combatId) => {
                if (e.target.type !== "checkbox") {
                  handleNpcClick(combatId);
                }
              };

              return (
                <ListItem
                  key={npc.combatId}
                  button
                  onClick={(e) => handleListItemClick(e, npc.combatId)}
                  sx={{
                    border: "1px solid #ddd",
                    marginY: 1,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    "&:hover": { backgroundColor: "#f1f1f1" },
                    paddingY: 1,
                    flexDirection: "row",
                    overflow: "hidden",
                  }}
                >
                  {/* Left: Index */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "100%",
                      borderRight: "1px solid #ccc",
                      padding: "0 10px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#333" }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  {/* Center: NPC Name & Stats */}
                  <ListItemText
                    primary={npc.id ? npc.name : "DELETED NPC"}
                    secondary={`${npc.combatStats?.currentHp}/${calcHP(
                      npc
                    )} HP | ${npc.combatStats?.currentMp}/${calcMP(
                      npc
                    )} MP`}
                    sx={{
                      flex: 1,
                      paddingLeft: 2,
                      fontWeight: "500",
                      fontSize: "1rem",
                      overflow: "hidden",
                    }}
                  />

                  {/* Actions */}
                  <ListItemSecondaryAction
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minWidth: "120px",
                      flexShrink: 0,
                      zIndex: 5, // Prevent overlap with turn counter
                    }}
                  >
                    {/* Turn Counter or Checkboxes */}
                    {npc.combatStats.turns.length > 1 ? (
                      <Button
                        variant={
                          npc.combatStats.turns.every((turn) => turn)
                            ? "contained"
                            : "outlined"
                        }
                        color={
                          npc.combatStats.turns.every((turn) => turn)
                            ? "success"
                            : "inherit"
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePopoverOpen(event, npc.combatId);
                        }}
                        sx={{
                          zIndex: 10, // Ensure button appears on top when clicked
                        }}
                      >
                        {
                          npc.combatStats.turns.filter((turn) => turn)
                            .length
                        }{" "}
                        / {npc.combatStats.turns.length}
                      </Button>
                    ) : (
                      npc.combatStats.turns
                        .slice(0, 3)
                        .map((turnTaken, turnIndex) => (
                          <Checkbox
                            key={turnIndex}
                            checked={turnTaken}
                            onChange={(e) => {
                              const newTurns = [...npc.combatStats.turns];
                              newTurns[turnIndex] = e.target.checked;
                              handleUpdateNpcTurns(npc.combatId, newTurns);
                            }}
                            color="success"
                            sx={{ padding: "2px", zIndex: 10 }}
                          />
                        ))
                    )}
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(npc.combatId);
                      }}
                      disabled={index === 0}
                      sx={{ padding: 1 }}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(npc.combatId);
                      }}
                      disabled={index === selectedNPCs.length - 1}
                      sx={{ padding: 1 }}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveNPC(npc.combatId);
                      }}
                      sx={{ padding: 1 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>

                  {/* Popover for extra turn checkboxes */}
                  <Popover
                    open={anchorEl && popoverNpcId === npc.combatId}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    sx={{
                      zIndex: 1300,
                    }}
                  >
                    <Box sx={{ padding: 1 }}>
                      {npc.combatStats.turns.map((turnTaken, turnIndex) => (
                        <Checkbox
                          key={turnIndex}
                          checked={turnTaken}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newTurns = [...npc.combatStats.turns];
                            newTurns[turnIndex] = e.target.checked;
                            handleUpdateNpcTurns(npc.combatId, newTurns);
                          }}
                          color="success"
                          sx={{ padding: "2px" }}
                        />
                      ))}
                    </Box>
                  </Popover>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}

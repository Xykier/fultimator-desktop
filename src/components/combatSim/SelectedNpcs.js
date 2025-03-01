import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Checkbox,
  Popover,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Replay,
  ArrowUpward,
  ArrowDownward,
  Delete,
  MoreVert,
} from "@mui/icons-material";
import { calcHP, calcMP } from "../../libs/npcs";
import { GiDeathSkull } from "react-icons/gi";
import { useTheme } from "@mui/material/styles";

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
  handleHpMpClick,
  isMobile,
  selectedNpcID,
}) {
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [selectedNpcMenu, setSelectedNpcMenu] = useState(null);

  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const handleMenuOpen = (event, npcId) => {
    setAnchorMenu(event.currentTarget);
    setSelectedNpcMenu(npcId);
  };

  const handleMenuClose = (e) => {
    e.stopPropagation();
    setAnchorMenu(null);
    setSelectedNpcMenu(null);
  };
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
        {isMobile ? (
          <IconButton
            size="small"
            sx={{ padding: 0 }}
            color="primary"
            onClick={handleResetTurns}
          >
            <Replay />
          </IconButton>
        ) : (
          <Button
            size="small"
            sx={{ padding: "0 0.5rem" }}
            color="primary"
            variant="outlined"
            onClick={handleResetTurns}
            endIcon={<Replay />}
          >
            Next Round
          </Button>
        )}
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
                    border:
                      selectedNpcID && selectedNpcID === npc.combatId
                        ? "1px solid " + primary
                        : "1px solid #ddd",
                    marginY: 1,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor:
                      npc.combatStats?.currentHp === 0 ? "#ffe6e6" : "inherit",
                    "&:hover": {
                      backgroundColor:
                        npc.combatStats?.currentHp === 0
                          ? "#ffcccc"
                          : "#f1f1f1",
                    },
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
                      width: isMobile ? "5px" : "10px",
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
                  <ListItemText
                    primary={
                      <Typography
                        variant="h4"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: npc.combatStats.turns.length > 1 ? "calc(100% - 88px)"  : "calc(100% - 55px)",
                        }}
                      >
                        {npc.id ? (
                          npc.combatStats?.currentHp === 0 ? (
                            <>
                              <GiDeathSkull style={{ marginRight: 5 }} />
                              {npc.name}
                            </>
                          ) : (
                            npc.name
                          )
                        ) : (
                          "DELETED NPC"
                        )}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="h5"
                          sx={{
                            color:
                              /* if HP is <= to half of max, make it red */ npc
                                .combatStats?.currentHp <=
                              Math.floor(calcHP(npc) / 2)
                                ? "#D32F2F"
                                : "#4CAF50",
                            fontWeight: "bold",
                            transition: "color 0.2s ease-in-out",
                            "&:hover": {
                              /* if HP is <= to half of max, make it dark red */
                              color:
                                npc.combatStats?.currentHp <=
                                Math.floor(calcHP(npc) / 2)
                                  ? "#B71C1C"
                                  : "#388E3C",
                              textDecoration: "underline",
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHpMpClick("HP", npc);
                          }}
                        >
                          {npc.combatStats?.currentHp}/{calcHP(npc)} HP
                        </Typography>
                        {" | "}
                        <Typography
                          component="span"
                          variant="h5"
                          sx={{
                            color: "#2196F3",
                            fontWeight: "bold",
                            transition: "color 0.2s ease-in-out",
                            "&:hover": {
                              color: "#1976D2",
                              textDecoration: "underline",
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHpMpClick("MP", npc);
                          }}
                        >
                          {npc.combatStats?.currentMp}/{calcMP(npc)} MP
                        </Typography>
                      </>
                    }
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
                          zIndex: 10,
                        }}
                        size= {isMobile ? "small" : "medium"}
                      >
                        {npc.combatStats.turns.filter((turn) => turn).length} /{" "}
                        {npc.combatStats.turns.length}
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
                    {isMobile ? (
                      <>
                        <IconButton
                          edge="end"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, npc.combatId);
                          }}
                          sx={{ padding: 1 }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorMenu}
                          open={
                            Boolean(anchorMenu) &&
                            selectedNpcMenu === npc.combatId
                          }
                          onClose={(e) => handleMenuClose(e)}
                        >
                          <MenuItem
                            onClick={(e) => {
                              handleMoveUp(npc.combatId);
                              handleMenuClose(e);
                            }}
                            disabled={index === 0}
                          >
                            Move Up
                          </MenuItem>
                          <MenuItem
                            onClick={(e) => {
                              handleMoveDown(npc.combatId);
                              handleMenuClose(e);
                            }}
                            disabled={index === selectedNPCs.length - 1}
                          >
                            Move Down
                          </MenuItem>
                          <MenuItem
                            onClick={(e) => {
                              handleRemoveNPC(npc.combatId);
                              handleMenuClose(e);
                            }}
                            sx={{ color: "error.main" }}
                          >
                            Delete
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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

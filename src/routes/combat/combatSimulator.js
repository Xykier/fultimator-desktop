import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getEncounterList,
  updateEncounter,
  getNpcs,
  getNpc,
} from "../../utility/db";
import Layout from "../../components/Layout";
import {
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Checkbox,
  Popover,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import NpcSelector from "../../components/combatSim/NpcSelector";
import NpcPretty from "../../components/npc/Pretty";
import {
  Close,
  Delete,
  ArrowUpward,
  ArrowDownward,
  Replay,
} from "@mui/icons-material";
import { calcHP, calcMP } from "../../libs/npcs";

export default function CombatSimulator() {
  return (
    <Layout fullWidth={true}>
      <CombatSim />
    </Layout>
  );
}

const CombatSim = () => {
  const { id } = useParams();
  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [npcList, setNpcList] = useState([]); // List of available NPCs
  const [selectedNPCs, setSelectedNPCs] = useState([]); // State for selected NPCs (with only identifiers)
  const [selectedNPC, setSelectedNPC] = useState(null); // State for selected NPC (full data)
  const [npcDrawerOpen, setNpcDrawerOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null); // Track last saved time
  const [isEditing, setIsEditing] = useState(false); // Editing mode for encounter name
  const [encounterName, setEncounterName] = useState(""); // Encounter name
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverNpcId, setPopoverNpcId] = useState(null);

  useEffect(() => {
    const fetchEncounter = async () => {
      const encounters = await getEncounterList();
      const foundEncounter = encounters.find((e) => e.id + "" === id);
      setEncounter(foundEncounter);
      setEncounterName(foundEncounter?.name || ""); // Set initial name
      setLoading(false);

      // Load NPCs using only IDs and combatIds
      const loadedNPCs = await Promise.all(
        foundEncounter?.selectedNPCs?.map(async (npcData) => {
          const npc = await getNpc(npcData.id); // Fetch full NPC data using id
          return {
            ...npc,
            combatId: npcData.combatId,
            combatStats: npcData.combatStats,
          }; // Add combatId back
        }) || []
      );
      setSelectedNPCs(loadedNPCs); // Set full NPC data
    };

    const fetchNpcs = async () => {
      const npcs = await getNpcs();
      setNpcList(npcs);
    };

    fetchEncounter();
    fetchNpcs();
  }, [id]);

  const handleSaveState = () => {
    const currentTime = new Date();
    setLastSaved(currentTime);

    // Save encounter state (only store necessary identifiers: id and combatId)
    updateEncounter({
      ...encounter,
      name: encounterName,
      selectedNPCs: selectedNPCs.map((npc) => ({
        id: npc.id,
        combatId: npc.combatId,
        combatStats: npc.combatStats,
      })), // Only save ids and combatIds
      currentTurn: encounter.currentTurn,
    });

    // Log full state for debugging (showing only IDs and combatIds)
    console.log("Saved Encounter State", {
      name: encounterName,
      selectedNPCs: selectedNPCs.map((npc) => ({
        id: npc.id,
        combatId: npc.combatId,
        combatStats: npc.combatStats,
      })),
      round: encounter.round,
      lastSaved: currentTime,
    });
  };

  const timeAgo = lastSaved
    ? `${Math.floor((new Date() - lastSaved) / 1000 / 60)} minutes ago`
    : "Not saved yet";

  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  const handleSaveEncounterName = () => {
    if (encounterName.trim() === "") {
      return;
    }
    setIsEditing(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSaveEncounterName();
    }
  };

  const handleBlur = () => {
    handleSaveEncounterName();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleIncreaseRound = () => {
    // Increment the round
    encounter.round += 1;
    setEncounter({ ...encounter }); // Trigger re-render or state update
  };

  const handleDecreaseRound = () => {
    // Decrease the round and prevent negative values
    encounter.round = Math.max(1, encounter.round - 1);
    setEncounter({ ...encounter }); // Trigger re-render or state update
  };

  const handleResetTurns = () => {
    // Reset the turns for each selected NPC
    selectedNPCs.forEach((npc) => {
      npc.combatStats.turns = npc.combatStats.turns.map(() => false); // Reset all turns
      handleUpdateNpcTurns(npc.combatId, npc.combatStats.turns);
    });

    // Increment the round
    encounter.round += 1;
    setEncounter({ ...encounter }); // Trigger re-render or state update
  };

  const handleSelectNPC = async (npcId) => {
    const npc = await getNpc(npcId); // Fetch full NPC data using getNpc
    setSelectedNPCs((prev) => [
      ...prev,
      {
        ...npc,
        combatId: `${npc.id}-${Date.now()}`,
        combatStats: {
          notes: "",
          currentHp: calcHP(npc),
          currentMp: calcMP(npc),
        },
      },
    ]);
  };

  const handleRemoveNPC = (npcCombatId) => {
    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId)
    );
  };

  const handleMoveUp = (npcCombatId) => {
    const index = selectedNPCs.findIndex((npc) => npc.combatId === npcCombatId);
    if (index > 0) {
      const updatedNPCs = [...selectedNPCs];
      const [movedNpc] = updatedNPCs.splice(index, 1);
      updatedNPCs.splice(index - 1, 0, movedNpc);
      setSelectedNPCs(updatedNPCs);
    }
  };

  const handleMoveDown = (npcCombatId) => {
    const index = selectedNPCs.findIndex((npc) => npc.combatId === npcCombatId);
    if (index < selectedNPCs.length - 1) {
      const updatedNPCs = [...selectedNPCs];
      const [movedNpc] = updatedNPCs.splice(index, 1);
      updatedNPCs.splice(index + 1, 0, movedNpc);
      setSelectedNPCs(updatedNPCs);
    }
  };

  const handleNpcClick = (npcCombatId) => {
    const npc = selectedNPCs.find((npc) => npc.combatId === npcCombatId);
    setSelectedNPC(npc); // Set clicked NPC as the selected NPC
  };

  const handleUpdateNpcTurns = (combatId, newTurns) => {
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === combatId
          ? { ...npc, combatStats: { ...npc.combatStats, turns: newTurns } }
          : npc
      )
    );
  };

  // Handle Popover open and close
  const handlePopoverOpen = (event, npcId) => {
    setAnchorEl(event.currentTarget);
    setPopoverNpcId(npcId);
  };

  const handlePopoverClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setPopoverNpcId(null);
  };

  // Determine number of turns based on rank
  const getTurnCount = (rank) => {
    if (rank === "soldier" || rank === "champion1" || !rank) return 1;
    if (rank === "elite") return 2;
    const match = rank.match(/champion(\d)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!encounter) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h5" color="error">
          Encounter not found!
        </Typography>
      </Box>
    );
  }

  // if mobile, not yet implemented
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h5" color="error" sx={{ mt: 5 }}>
          Mobile View not yet implemented!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Encounter Name, Save Button and Last Saved Time */}
      <BattleHeader
        encounterName={encounterName}
        isEditing={isEditing}
        handleEditClick={handleEditClick}
        handleEncounterNameChange={handleEncounterNameChange}
        handleBlur={handleBlur}
        handleKeyPress={handleKeyPress}
        handleSaveState={handleSaveState}
        timeAgo={timeAgo}
        round={encounter.round}
        handleIncreaseRound={handleIncreaseRound}
        handleDecreaseRound={handleDecreaseRound}
      />
      {/* Three Columns: NPC Selector, Selected NPCs, NPC Sheet */}
      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 205px)" }}>
        {/* NPC Selector */}
        <NpcSelector
          isMobile={isMobile}
          npcDrawerOpen={npcDrawerOpen}
          setNpcDrawerOpen={setNpcDrawerOpen}
          npcList={npcList}
          handleSelectNPC={handleSelectNPC}
        />
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

        {/* NPC Sheet */}
        <Box
          sx={{
            width: "30%",
            bgcolor: "#fff",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Header with Close Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #ccc",
              paddingBottom: 1,
            }}
          >
            <Typography variant="h5" sx={{ flexShrink: 0 }}>
              NPC Sheet
            </Typography>
            {selectedNPC && (
              <IconButton
                size="small"
                sx={{ padding: 0 }}
                onClick={() => setSelectedNPC(null)}
              >
                <Close />
              </IconButton>
            )}
          </Box>

          {/* Scrollable NPC Content */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
            {selectedNPC && <NpcPretty npc={selectedNPC} collapse={true} />}
          </Box>

          {/* Attributes Section */}
          {selectedNPC && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                borderTop: "1px solid #ccc",
                paddingY: 1,
                bgcolor: "#f5f5f5",
              }}
            >
              {[
                {
                  label: "DEX",
                  value: selectedNPC.attributes?.dexterity,
                  color: "#ff7043",
                }, // Orange
                {
                  label: "INT",
                  value: selectedNPC.attributes?.insight,
                  color: "#42a5f5",
                }, // Blue
                {
                  label: "MIG",
                  value: selectedNPC.attributes?.might,
                  color: "#66bb6a",
                }, // Green
                {
                  label: "WLP",
                  value: selectedNPC.attributes?.will,
                  color: "#ab47bc",
                }, // Purple
              ].map((attr) => (
                <Box
                  key={attr.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "16px",
                    overflow: "hidden",
                    bgcolor: "#e0e0e0",
                  }}
                >
                  {/* Label Part */}
                  <Box
                    sx={{
                      bgcolor: attr.color,
                      color: "white",
                      paddingX: 1,
                      paddingY: 0.5,
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    {attr.label}
                  </Box>

                  {/* Value Part */}
                  <Box
                    sx={{
                      paddingX: 1.5,
                      paddingY: 0.5,
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {attr.value}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Static Button Section */}
          {selectedNPC && (
            <Box
              sx={{
                borderTop: "1px solid #ccc",
                paddingTop: 1,
                paddingBottom: 1,
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <Button variant="contained" color="primary">
                HP - MP - Statuses
              </Button>
              <Button variant="contained" color="secondary">
                Rolls
              </Button>
              <Button variant="contained" color="ternary">
                Study
              </Button>
              <Button variant="contained" color="ternary">
                Notes
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

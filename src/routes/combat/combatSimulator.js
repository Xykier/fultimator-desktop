import React, { useState, useEffect, useRef } from "react";
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
  IconButton,
  Button,
  Select,
  MenuItem,
  Tooltip,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import NpcSelector from "../../components/combatSim/NpcSelector";
import NpcPretty from "../../components/npc/Pretty";
import {
  Close,
  Download,
  Description,
  Favorite,
  Casino,
  Edit,
} from "@mui/icons-material";
import { calcHP, calcMP } from "../../libs/npcs";
import SelectedNpcs from "../../components/combatSim/SelectedNpcs";
import useDownloadImage from "../../hooks/useDownloadImage";

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
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedStudy, setSelectedStudy] = useState(0);
  const ref = useRef();
  const [downloadImage] = useDownloadImage(selectedNPC?.name, ref);

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
    setSelectedStudy(0);
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

  const handleStudyChange = (event) => {
    setSelectedStudy(event.target.value);
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
  /*if (isMobile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h5" color="error" sx={{ mt: 5 }}>
          Mobile View not yet implemented!
        </Typography>
      </Box>
    );
  }*/

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
      {isMobile && (
        <NpcSelector // NPC Selector
          isMobile={isMobile}
          npcDrawerOpen={npcDrawerOpen}
          setNpcDrawerOpen={setNpcDrawerOpen}
          npcList={npcList}
          handleSelectNPC={handleSelectNPC}
        />
      )}

      {/* Three Columns: NPC Selector, Selected NPCs, NPC Sheet */}
      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 205px)" }}>
        {/* NPC Selector */}
        {!isMobile && <NpcSelector
          isMobile={isMobile}
          npcDrawerOpen={npcDrawerOpen}
          setNpcDrawerOpen={setNpcDrawerOpen}
          npcList={npcList}
          handleSelectNPC={handleSelectNPC}
        />}
        {/* Selected NPCs */}
        <SelectedNpcs
          selectedNPCs={selectedNPCs}
          handleResetTurns={handleResetTurns}
          handleMoveUp={handleMoveUp}
          handleMoveDown={handleMoveDown}
          handleRemoveNPC={handleRemoveNPC}
          handleUpdateNpcTurns={handleUpdateNpcTurns}
          handlePopoverOpen={handlePopoverOpen}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          popoverNpcId={popoverNpcId}
          getTurnCount={getTurnCount}
          handleNpcClick={handleNpcClick}
        />

        {/* NPC Sheet */}
        {selectedNPC && (
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
                {selectedNPC ? selectedNPC.name : "NPC Sheet"}
              </Typography>
              {selectedNPC && (
                <IconButton
                  size="small"
                  sx={{ padding: 0 }}
                  onClick={() => {
                    setSelectedNPC(null);
                    setTabIndex(0);
                  }}
                >
                  <Close />
                </IconButton>
              )}
            </Box>

            {/* Tabs */}
            {selectedNPC && (
              <Tabs
                value={tabIndex}
                onChange={(_, newIndex) => setTabIndex(newIndex)}
                variant="fullWidth"
                sx={{ minHeight: 40 }} // Reduce overall height
              >
                <Tab
                  icon={<Description fontSize="small" />}
                  label={<Typography variant="body2">Sheet</Typography>}
                  iconPosition="start"
                  sx={{ minHeight: 40, padding: "4px 8px" }}
                />
                <Tab
                  icon={<Favorite fontSize="small" />}
                  label={<Typography variant="body2">Stats</Typography>}
                  iconPosition="start"
                  sx={{ minHeight: 40, padding: "4px 8px" }}
                />
                <Tab
                  icon={<Casino fontSize="small" />}
                  label={<Typography variant="body2">Rolls</Typography>}
                  iconPosition="start"
                  sx={{ minHeight: 40, padding: "4px 8px" }}
                />
                <Tab
                  icon={<Edit fontSize="small" />}
                  label={<Typography variant="body2">Notes</Typography>}
                  iconPosition="start"
                  sx={{ minHeight: 40, padding: "4px 8px" }}
                />
              </Tabs>
            )}

            {/* Tab Content */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
              {tabIndex === 0 && selectedNPC && (
                <>
                  <NpcPretty
                    npc={selectedNPC}
                    npcImage={selectedNPC.imgurl}
                    collapse={true}
                    study={selectedStudy}
                    ref={ref}
                  />
                </>
              )}
              {tabIndex === 1 && (
                <Typography>HP / MP / Statuses Section</Typography>
              )}
              {tabIndex === 2 && <Typography>Rolls Section</Typography>}
              {tabIndex === 3 && selectedNPC && (
                <TextField
                  label="Notes"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={10}
                  value={
                    selectedNPCs.find(
                      (npc) => npc.combatId === selectedNPC.combatId
                    )?.combatStats?.notes || ""
                  }
                  onChange={(e) => {
                    const updatedNPCs = selectedNPCs.map((npc) => {
                      if (npc.combatId === selectedNPC.combatId) {
                        return {
                          ...npc,
                          combatStats: {
                            ...npc.combatStats,
                            notes: e.target.value,
                          },
                        };
                      }
                      return npc;
                    });

                    // Update the list of selected NPCs with the modified notes
                    setSelectedNPCs(updatedNPCs);
                  }}
                  sx={{ mt: 2 }} // Add some top margin for spacing
                />
              )}
            </Box>
            {selectedNPC && tabIndex === 0 && (
              <Box
                sx={{
                  borderTop: "1px solid #ccc",
                  paddingTop: 1,
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 1,
                }}
              >
                {/* Study Dropdown Only in NPC Sheet */}
                <Select
                  value={selectedStudy}
                  onChange={handleStudyChange}
                  size="small"
                >
                  <MenuItem value={0}>Study</MenuItem>
                  <MenuItem value={1}>7+</MenuItem>
                  <MenuItem value={2}>10+</MenuItem>
                  <MenuItem value={3}>13+</MenuItem>
                </Select>
                <Tooltip title="Download Sheet" placement="bottom">
                  <Button
                    color="primary"
                    aria-label="download"
                    onClick={downloadImage}
                    sx={{ cursor: "pointer" }}
                  >
                    <Download />
                  </Button>
                </Tooltip>
              </Box>
            )}
            {/* NPC Attributes Always Visible */}
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

            {/* Download Button Always Visible */}
          </Box>
        )}
      </Box>
    </Box>
  );
};

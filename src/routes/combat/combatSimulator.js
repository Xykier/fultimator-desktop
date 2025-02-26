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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import NpcSelector from "../../components/combatSim/NpcSelector";
import NpcPretty from "../../components/npc/Pretty";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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
          return { ...npc, combatId: npcData.combatId }; // Add combatId back
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
      })), // Only save ids and combatIds
    });

    // Log full state for debugging (showing only IDs and combatIds)
    console.log("Saved Encounter State", {
      name: encounterName,
      selectedNPCs: selectedNPCs.map((npc) => ({
        id: npc.id,
        combatId: npc.combatId,
        combatStats: npc.combatStats,
      })),
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

  const handleSelectNPC = async (npcId) => {
    const npc = await getNpc(npcId); // Fetch full NPC data using getNpc
    setSelectedNPCs((prev) => [
      ...prev,
      { ...npc, combatId: `${npc.id}-${Date.now()}`, combatStats: { notes: "", currentHp: ((npc.attributes["might"] * 5)+(npc.lvl*2) + parseInt(npc.extra.hp || 0))} },
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
          <Typography
            variant="h5"
            sx={{
              flexShrink: 0,
              borderBottom: "1px solid #ccc",
              paddingBottom: 1,
            }}
          >
            Selected NPCs
          </Typography>
          <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
            {selectedNPCs.length === 0 ? (
              <Typography>No NPC selected</Typography>
            ) : (
                <List>
                {selectedNPCs.map((npc, index) => (
                  <ListItem
                  key={npc.combatId}
                  button
                  onClick={() => handleNpcClick(npc.combatId)}
                  sx={{
                    border: "1px solid #ddd", // Light border for separation
                    marginY: 1,
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between", // Aligning elements properly
                    '&:hover': {
                      backgroundColor: "#f1f1f1", // Hover effect for the item
                    },
                  }}
                >
                  {/* Left part: Index */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "30px",
                      height: "100%",
                      borderRight: "1px solid #ccc",
                      padding: "0 10px", // Add padding for spacing
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                      {index + 1}
                    </Typography>
                  </Box>
                
                  {/* Right part: NPC Name */}
                  <ListItemText
                    primary={npc.id ? npc.name : "DELETED NPC"}
                    secondary={npc.combatStats?.currentHp}
                    sx={{
                      flex: 1,
                      paddingLeft: 2,
                      fontWeight: "500",
                      fontSize: "1rem", // Adjust font size for readability
                    }}
                  />
                
                  {/* Right part: Actions */}
                  <ListItemSecondaryAction sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(npc.combatId);
                      }}
                      disabled={index === 0} // Disable up button for the first NPC
                      sx={{ padding: 1 }}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(npc.combatId);
                      }}
                      disabled={index === selectedNPCs.length - 1} // Disable down button for the last NPC
                      sx={{ padding: 1 }}
                    >
                      <ArrowDownwardIcon fontSize="small" />
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
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                ))}
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
          <Typography
            variant="h5"
            sx={{
              flexShrink: 0,
              borderBottom: "1px solid #ccc",
              paddingBottom: 1,
            }}
          >
            NPC Sheet
          </Typography>
          <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
            {selectedNPC && <NpcPretty npc={selectedNPC} collapse={true} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

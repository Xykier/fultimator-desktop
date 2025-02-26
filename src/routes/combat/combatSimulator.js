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
  Button,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import NpcSelector from "../../components/combatSim/NpcSelector";

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
      { ...npc, combatId: `${npc.id}-${Date.now()}` },
    ]);
  };

  const handleRemoveNPC = (npcCombatId) => {
    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId)
    );
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

        {/* Selected NPCs */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "#fff",
            padding: 2,
            overflowY: "auto",
            height: "100%",
          }}
        >
          <Typography variant="h5">Selected NPCs</Typography>
          {selectedNPCs.length === 0 ? (
            <Typography>No NPC selected</Typography>
          ) : (
            selectedNPCs.map((npc) => (
              <Box
                key={npc.combatId}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography>{npc.id ? npc.name : "DELETED NPC"}</Typography>
                <Button
                  onClick={() => handleRemoveNPC(npc.combatId)}
                  sx={{ color: "red" }}
                >
                  Remove
                </Button>
              </Box>
            ))
          )}
        </Box>

        {/* NPC Sheet */}
        <Box
          sx={{
            width: "30%",
            bgcolor: "#fff",
            padding: 2,
            overflowY: "auto",
            height: "100%",
          }}
        >
          <Typography variant="h5">NPC Sheet</Typography>
          {selectedNPCs.length === 0 ? (
            <Typography>Select an NPC</Typography>
          ) : (
            selectedNPCs.map((npc) => (
              <Box key={npc.combatId}>
                <Typography>{npc.name}</Typography>
                {/* Display other NPC details here */}
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

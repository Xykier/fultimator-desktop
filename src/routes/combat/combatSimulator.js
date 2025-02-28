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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import StatsTab from "../../components/combatSim/StatsTab";
import NotesTab from "../../components/combatSim/NotesTab";
import AttributeSection from "../../components/combatSim/AttributeSection";

export default function CombatSimulator() {
  return (
    <Layout fullWidth={true}>
      <CombatSim />
    </Layout>
  );
}

const CombatSim = () => {
  // Base states
  const { id } = useParams(); // Get the encounter ID from the URL
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true); // Loading state

  // Encounter states
  const [encounter, setEncounter] = useState(null); // State for the current encounter
  const [npcList, setNpcList] = useState([]); // List of available NPCs ready for selection
  const [selectedNPCs, setSelectedNPCs] = useState([]); // State for selected NPCs list
  const [selectedNPC, setSelectedNPC] = useState(null); // State for selected NPC (for NPC Sheet)
  const [npcClicked, setNpcClicked] = useState(null); // State for the NPC clicked for HP/MP change
  const [npcDrawerOpen, setNpcDrawerOpen] = useState(false); // NPC Drawer open state (for mobile)
  const [lastSaved, setLastSaved] = useState(null); // Track last saved time
  const [isEditing, setIsEditing] = useState(false); // Editing mode for encounter name
  const [encounterName, setEncounterName] = useState(""); // Encounter name
  const [anchorEl, setAnchorEl] = useState(null); // Turns popover anchor element
  const [popoverNpcId, setPopoverNpcId] = useState(null); // NPC ID for the turns popover
  const [tabIndex, setTabIndex] = useState(0); // Tab index for the selected NPC sheet/stats/rolls/notes
  const [open, setOpen] = useState(false); // Dialog open state for HP/MP change
  const [statType, setStatType] = useState(null); // "HP" or "MP"
  const [value, setValue] = useState(0); // Value for HP/MP change

  // Study and Download image states
  const [selectedStudy, setSelectedStudy] = useState(0); // Study dropdown value
  const ref = useRef(); // Reference for the NPC sheet image download
  const [downloadImage] = useDownloadImage(selectedNPC?.name, ref); // Download image hook

  // Fetch encounter and NPCs on initial load
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

  // Save encounter state 
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

  // Calculate time since last save
  const timeAgo = lastSaved
    ? `${Math.floor((new Date() - lastSaved) / 1000 / 60)} minutes ago`
    : "Not saved yet";

    /* ENCOUNTER NAME EDITING */  
  // Handle Encounter Name Change
  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  // Save Encounter Name
  const handleSaveEncounterName = () => {
    if (encounterName.trim() === "") {
      return;
    }
    setIsEditing(false);
  };

  // Handle Enter key press and blur for saving encounter name
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSaveEncounterName();
    }
  };

  // Handle Blur for saving encounter name
  const handleBlur = () => {
    handleSaveEncounterName();
  };

  // Handle Edit Click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  /* NPC ROUNDS AND TURNS */
  // Handle Round Increase
  const handleIncreaseRound = () => {
    // Increment the round
    encounter.round += 1;
    setEncounter({ ...encounter }); // Trigger re-render or state update
  };

  // Handle Round Decrease
  const handleDecreaseRound = () => {
    // Decrease the round and prevent negative values
    encounter.round = Math.max(1, encounter.round - 1);
    setEncounter({ ...encounter }); // Trigger re-render or state update
  };

  // Handle Reset Turns
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

  // Handle Update NPC Turns
  const handleUpdateNpcTurns = (combatId, newTurns) => {
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === combatId
          ? { ...npc, combatStats: { ...npc.combatStats, turns: newTurns } }
          : npc
      )
    );
  };

  // Handle Turns Popover open
  const handlePopoverOpen = (event, npcId) => {
    setAnchorEl(event.currentTarget);
    setPopoverNpcId(npcId);
  };

  // Handle Turns Popover close
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

  // Handle Select NPC from the list of available NPCs
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

  // Handle Remove NPC from the selected NPCs list
  const handleRemoveNPC = (npcCombatId) => {
    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId)
    );
  };

  // Handle Move Up in the selected NPCs list
  const handleMoveUp = (npcCombatId) => {
    const index = selectedNPCs.findIndex((npc) => npc.combatId === npcCombatId);
    if (index > 0) {
      const updatedNPCs = [...selectedNPCs];
      const [movedNpc] = updatedNPCs.splice(index, 1);
      updatedNPCs.splice(index - 1, 0, movedNpc);
      setSelectedNPCs(updatedNPCs);
    }
  };

  // Handle Move Down in the selected NPCs list
  const handleMoveDown = (npcCombatId) => {
    const index = selectedNPCs.findIndex((npc) => npc.combatId === npcCombatId);
    if (index < selectedNPCs.length - 1) {
      const updatedNPCs = [...selectedNPCs];
      const [movedNpc] = updatedNPCs.splice(index, 1);
      updatedNPCs.splice(index + 1, 0, movedNpc);
      setSelectedNPCs(updatedNPCs);
    }
  };

  // Handle NPC Click in the selected NPCs list
  const handleNpcClick = (npcCombatId) => {
    const npc = selectedNPCs.find((npc) => npc.combatId === npcCombatId);
    setSelectedNPC(npc); // Set clicked NPC as the selected NPC
    setSelectedStudy(0);
  };

  // Handle Study Change
  const handleStudyChange = (event) => {
    setSelectedStudy(event.target.value);
  };

  // Handle Open HP/MP Dialog
  const handleOpen = (type, npc) => {
    setStatType(type);
    setValue(0);
    setOpen(true);
    setNpcClicked(npc);
  };

  // Handle Close HP/MP Dialog
  const handleClose = () => {
    setOpen(false);
    setNpcClicked(null);
  };

  // Handle Confirm HP/MP Dialog
  const handleConfirm = () => {
    const updatedNPCs = selectedNPCs.map((npc) => {
      if (npc.combatId === npcClicked.combatId) {
        const maxHP = calcHP(npcClicked);
        const maxMP = calcMP(npcClicked);
        const newHp = Math.min(
          Math.max(npc.combatStats.currentHp - value, 0),
          maxHP
        );
        const newMp = Math.min(
          Math.max(npc.combatStats.currentMp - value, 0),
          maxMP
        );

        return {
          ...npc,
          combatStats: {
            ...npc.combatStats,
            currentHp: statType === "HP" ? newHp : npc.combatStats.currentHp,
            currentMp: statType === "MP" ? newMp : npc.combatStats.currentMp,
          },
        };
      }
      return npc;
    });

    setSelectedNPCs(updatedNPCs);

    if (selectedNPC && selectedNPC.combatId === npcClicked.combatId) {
      const maxHP = calcHP(npcClicked);
      const maxMP = calcMP(npcClicked);
      const newHp = Math.min(
        Math.max(npcClicked.combatStats.currentHp - value, 0),
        maxHP
      );
      const newMp = Math.min(
        Math.max(npcClicked.combatStats.currentMp - value, 0),
        maxMP
      );

      setSelectedNPC({
        ...selectedNPC,
        combatStats: {
          ...selectedNPC.combatStats,
          currentHp:
            statType === "HP" ? newHp : selectedNPC.combatStats.currentHp,
          currentMp:
            statType === "MP" ? newMp : selectedNPC.combatStats.currentMp,
        },
      });
    }

    handleClose();
  };

  // Handle Status Effect Toggle
  const toggleStatusEffect = (npc, status) => {
    const updatedStatusEffects = [...(npc.combatStats?.statusEffects || [])];

    // Toggle the status effect (add if not present, remove if present)
    if (updatedStatusEffects.includes(status)) {
      const index = updatedStatusEffects.indexOf(status);
      updatedStatusEffects.splice(index, 1);
    } else {
      updatedStatusEffects.push(status);
    }

    // Update the NPC with the new status effects
    const updatedNPC = {
      ...npc,
      combatStats: {
        ...npc.combatStats,
        statusEffects: updatedStatusEffects,
      },
    };

    setSelectedNPC(updatedNPC);

    // Update data in the selectedNPCs list
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === updatedNPC.combatId ? updatedNPC : npc
      )
    );
  };

  // Calculate Current Attribute Value based on Status Effects
  function calcAttr(statusEffect1, statusEffect2, attribute, npc) {
    // Define the base attribute value (e.g., dexterity)
    let attributeValue = npc?.attributes?.[attribute] || 6; // Default to 6 if attribute is missing

    // Check in npc.combatStats.statusEffects for the status effects
    if (npc.combatStats.statusEffects?.includes(statusEffect1)) {
      attributeValue -= 2;
    }
    if (npc.combatStats.statusEffects?.includes(statusEffect2)) {
      attributeValue -= 2;
    }

    // Ensure the attribute stays within the defined bounds
    attributeValue = Math.max(6, Math.min(12, attributeValue));

    return attributeValue;
  }

  // During loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // If encounter is not found
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
        {!isMobile && (
          <NpcSelector
            isMobile={isMobile}
            npcDrawerOpen={npcDrawerOpen}
            setNpcDrawerOpen={setNpcDrawerOpen}
            npcList={npcList}
            handleSelectNPC={handleSelectNPC}
          />
        )}
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
          handleHpMpClick={(type, npc) => handleOpen(type, npc)}
          isMobile={isMobile}
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
                <StatsTab
                  selectedNPC={selectedNPC}
                  calcHP={calcHP}
                  calcMP={calcMP}
                  handleOpen={handleOpen}
                  toggleStatusEffect={toggleStatusEffect}
                />
              )}
              {tabIndex === 2 && <Typography>Rolls Section</Typography>}
              {tabIndex === 3 && selectedNPC && (
                <NotesTab
                  selectedNPC={selectedNPC}
                  selectedNPCs={selectedNPCs}
                  setSelectedNPCs={setSelectedNPCs}
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
              <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
            )}
          </Box>
        )}
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{ "& .MuiDialog-paper": { borderRadius: 3, padding: 2 } }}
      >
        <DialogTitle
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "1px solid #ddd",
            pb: 1,
          }}
        >
          {statType === "HP" ? "Modify HP" : "Modify MP"}
        </DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirm();
          }}
        >
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 1,
            }}
          >
            <TextField
              fullWidth
              type="text"
              label="Amount (negative to heal)"
              value={value}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (/^-?\d*$/.test(inputValue)) {
                  setValue(inputValue);
                }
              }}
              onBlur={() => {
                setValue(value === "" ? 0 : Number(value));
              }}
              margin="normal"
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={handleClose}
              color="primary"
              sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              OK
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

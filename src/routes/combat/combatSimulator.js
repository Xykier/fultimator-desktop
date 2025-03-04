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
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import NpcSelector from "../../components/combatSim/NpcSelector";
import { calcHP, calcMP } from "../../libs/npcs";
import SelectedNpcs from "../../components/combatSim/SelectedNpcs";
import useDownloadImage from "../../hooks/useDownloadImage";
import NPCDetail from "../../components/combatSim/NPCDetail";
import { typesList } from "../../libs/types";
import { TypeIcon } from "../../components/types";
import { IoShield } from "react-icons/io5";
import { t } from "../../translation/translate";
import ReactMarkdown from "react-markdown";

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
  const inputRef = useRef(null);

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
  const [isHealing, setIsHealing] = useState(false); // true = Heal, false = Damage
  const [damageType, setDamageType] = useState(""); // Type of damage (physical, magical, etc.)
  const [isGuarding, setIsGuarding] = useState(false); // true = Guarding, false = Not guarding

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
      round: encounter.round,
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
  const minutes = Math.floor((new Date() - lastSaved) / 1000 / 60);

  const timeAgo = lastSaved
    ? t("combat_sim_last_saved_before") + " " + minutes + " " + t("combat_sim_last_saved_after")
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
    if (selectedNPCs.length < 30) {
      const npc = await getNpc(npcId); // Fetch full NPC data using getNpc

      // Calculate Ultima value only if the NPC is a villain
      let ultimaValue = null;
      if (npc.villain === "minor") {
        ultimaValue = 5;
      } else if (npc.villain === "major") {
        ultimaValue = 10;
      } else if (npc.villain === "superme") {
        ultimaValue = 15;
      }

      // Create combatStats object and conditionally add ultima
      const combatStats = {
        notes: "",
        currentHp: calcHP(npc),
        currentMp: calcMP(npc),
        ...(ultimaValue !== null && { ultima: ultimaValue }), // Only add ultima if it's not null
      };

      setSelectedNPCs((prev) => [
        ...prev,
        {
          ...npc,
          combatId: `${npc.id}-${Date.now()}`,
          combatStats: combatStats,
        },
      ]);
    } else {
      if (window.electron) {
        window.electron.alert(t("combat_sim_too_many_npcs"));
      } else {
        alert(t("combat_sim_too_many_npcs"));
      }
    }
  };

  // Handle Remove NPC from the selected NPCs list
  const handleRemoveNPC = (npcCombatId) => {
    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId)
    );
    // if selectedNPC is the one removed, set selectedNPC to null
    if (selectedNPC?.combatId === npcCombatId) {
      setSelectedNPC(null);
    }
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
    setValue("");
    setDamageType("");
    setIsGuarding(false);
    setOpen(true);
    setNpcClicked(npc);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle Close HP/MP Dialog
  const handleClose = () => {
    setOpen(false);
    setNpcClicked(null);
    setIsHealing(false);
  };

  // Handle Confirm HP/MP Dialog
  const handleConfirm = () => {
    let adjustedValue = 0;

    if (damageType !== "" && !isHealing && statType === "HP") {
      adjustedValue = -Number(
        calculateDamage(npcClicked, value, damageType, isGuarding)
      );
    } else {
      adjustedValue = isHealing ? Number(value) : -Number(value);
    }

    const updatedNPCs = selectedNPCs.map((npc) => {
      if (npc.combatId === npcClicked.combatId) {
        const maxHP = calcHP(npcClicked);
        const maxMP = calcMP(npcClicked);
        const newHp = Math.min(
          Math.max(
            npc.combatStats.currentHp + (statType === "HP" ? adjustedValue : 0),
            0
          ),
          maxHP
        );
        const newMp = Math.min(
          Math.max(
            npc.combatStats.currentMp + (statType === "MP" ? adjustedValue : 0),
            0
          ),
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
        Math.max(
          npcClicked.combatStats.currentHp +
            (statType === "HP" ? adjustedValue : 0),
          0
        ),
        maxHP
      );
      const newMp = Math.min(
        Math.max(
          npcClicked.combatStats.currentMp +
            (statType === "MP" ? adjustedValue : 0),
          0
        ),
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

  // Handle Input Change in HP/MP Dialog
  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      setValue(inputValue);
    }
  };

  // Calculate damage with affinities
  function calculateDamage(
    npc,
    damageValue,
    damageType = "",
    isGuarding = false
  ) {
    const affinities = npc.affinities || {};
    const damage = parseInt(damageValue, 10) || 0;

    // Default damage value
    let finalDamage = damage;

    if (affinities[damageType]) {
      switch (affinities[damageType]) {
        case "vu": // Vulnerable (x2)
          finalDamage = isGuarding ? damage : damage * 2;
          break;
        case "rs": // Resistant (x0.5, rounded down)
          finalDamage = Math.floor(damage * 0.5);
          break;
        case "ab": // Absorb (turn damage into healing)
          finalDamage = -damage;
          break;
        case "im": // Immune (no damage)
          finalDamage = 0;
          break;
        default:
          break;
      }
    } else if (isGuarding) {
      finalDamage = Math.floor(damage * 0.5);
    }

    if (isGuarding && damageType === "") {
      finalDamage = Math.floor(damage * 0.5);
    }

    return finalDamage;
  }

  // Handle Submit in HP/MP Dialog
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value !== "") handleConfirm(isHealing ? Number(value) : -Number(value));
    else handleClose();
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

  // Handle Ultima Points
  const handleIncreaseUltima = () => {
    // update SelectedNPC and selectedNPCs
    setSelectedNPC((prev) => ({
      ...prev,
      combatStats: {
        ...prev.combatStats,
        ultima: prev.combatStats.ultima + 1,
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                ultima: npc.combatStats.ultima + 1,
              },
            }
          : npc
      )
    );
  };

  const handleDecreaseUltima = () => {
    // update SelectedNPC and selectedNPCs
    setSelectedNPC((prev) => ({
      ...prev,
      combatStats: {
        ...prev.combatStats,
        ultima: prev.combatStats.ultima - 1,
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                ultima: npc.combatStats.ultima - 1,
              },
            }
          : npc
      )
    );
  };

  // During loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // If encounter is not found
  if (!encounter) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">
          {t("combat_sim_encounter_not_found")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: -2,
      }}
    >
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
        isMobile={isMobile}
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
      <Box
        sx={{
          display: "flex",
          gap: 2,
          height: isMobile ? "calc(100vh - 211px)" : "calc(100vh - 176px)",
        }}
      >
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
          selectedNpcID={selectedNPC?.combatId}
        />

        {/* NPC Sheet */}
        <NPCDetail
          selectedNPC={selectedNPC}
          setSelectedNPC={setSelectedNPC}
          tabIndex={tabIndex}
          setTabIndex={setTabIndex}
          selectedStudy={selectedStudy}
          handleStudyChange={handleStudyChange}
          downloadImage={downloadImage}
          calcHP={calcHP}
          calcMP={calcMP}
          handleOpen={handleOpen}
          toggleStatusEffect={toggleStatusEffect}
          selectedNPCs={selectedNPCs}
          setSelectedNPCs={setSelectedNPCs}
          calcAttr={calcAttr}
          handleDecreaseUltima={handleDecreaseUltima}
          handleIncreaseUltima={handleIncreaseUltima}
          isMobile={isMobile}
        />
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
          {statType === "HP"
            ? t("combat_sim_edit_hp")
            : t("combat_sim_edit_mp")}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, mt: -2 }}>
              {npcClicked?.name}
            </Typography>
            <ToggleButtonGroup
              value={isHealing ? "heal" : "damage"}
              exclusive
              onChange={(event, newValue) => {
                if (newValue !== null) {
                  setIsHealing(newValue === "heal");
                }
              }}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="heal" color="success">
                {t("combat_sim_healing")}
              </ToggleButton>
              <ToggleButton value="damage" color="error">
                {t("combat_sim_damage")}
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              fullWidth
              type="text"
              label={t("combat_sim_amount")}
              value={value}
              onChange={handleChange}
              onBlur={() => setValue(value === "" ? "" : Number(value))}
              margin="normal"
              inputRef={inputRef} // Auto-focus when dialog opens
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                },
              }}
            />
            {/* Damage type selector (from typesList) only for hp damage */}
            {statType === "HP" && !isHealing && (
              <>
                <FormControl
                  fullWidth
                  sx={{
                    mt: 2,
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  <InputLabel id="damage-type-label">
                    {t("combat_sim_damage_type")}
                  </InputLabel>
                  <Select
                    label={t("combat_sim_damage_type")}
                    value={damageType}
                    onChange={(e) => {
                      setDamageType(e.target.value);
                    }}
                  >
                    <MenuItem value="">
                      <ListItemText>{t("combat_sim_none")}</ListItemText>
                    </MenuItem>
                    {typesList.map((type) => (
                      <MenuItem
                        key={type}
                        value={type}
                        sx={{
                          display: "flex",
                          alignItems: "center", // Ensure horizontal alignment
                          paddingY: "6px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            minWidth: 70,
                          }}
                        >
                          <TypeIcon type={type} />
                          <ListItemText
                            sx={{
                              ml: 1,
                              marginBottom: 0,
                              textTransform: "capitalize",
                            }}
                          >
                            {t(type)}
                          </ListItemText>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Guarding checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isGuarding}
                      onChange={(e) => {
                        setIsGuarding(e.target.checked);
                      }}
                      sx={{
                        mt: 0,
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.5rem",
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IoShield
                        size={20}
                        color={isGuarding ? "green" : "gray"}
                      />
                      {t("combat_sim_is_guarding")}?
                    </Box>
                  }
                />

                {npcClicked &&
                  (damageType !== "" || isGuarding) &&
                  value !== "" && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, display: "inline" }}
                    >
                      {t("combat_sim_calculated_damage")}:{" "}
                      <strong
                        style={{
                          color: (() => {
                            const calculated = calculateDamage(
                              npcClicked,
                              value,
                              damageType,
                              isGuarding
                            );
                            return calculated < 0 ? "green" : "#cc0000"; // Green for healing, Red for damage
                          })(),
                        }}
                      >
                        <ReactMarkdown components={{ p: "span" }}>
                          {(() => {
                            const calculated = calculateDamage(
                              npcClicked,
                              value,
                              damageType,
                              isGuarding
                            );
                            return calculated < 0
                              ? `${Math.abs(calculated)} ${damageType} healing`
                              : `${calculated} ${
                                  damageType
                                    ? t(damageType + "_damage")
                                    : t("notype_damage")
                                }`;
                          })()}
                        </ReactMarkdown>
                      </strong>
                    </Typography>
                  )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={handleClose}
              color="primary"
              sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
            >
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
            >
              {t("OK")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

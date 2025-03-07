import React from "react";
import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Divider,
  FormHelperText,
} from "@mui/material";
import {
  Close,
  Description,
  Favorite,
  Casino,
  Edit,
  Download,
} from "@mui/icons-material";
import NpcPretty from "../npc/Pretty";
import StatsTab from "./StatsTab";
import NotesTab from "./NotesTab";
import AttributeSection from "./AttributeSection";
import CasinoIcon from "@mui/icons-material/Casino";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import {
  DistanceIcon,
  MeleeIcon,
  OffensiveSpellIcon,
  SpellIcon,
} from "../icons.js";
import Diamond from "../Diamond";
import { calcPrecision, calcDamage, calcMagic } from "../../libs/npcs";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

const NPCDetail = ({
  selectedNPC,
  setSelectedNPC,
  tabIndex,
  setTabIndex,
  selectedStudy,
  handleStudyChange,
  downloadImage,
  calcHP,
  calcMP,
  handleOpen,
  toggleStatusEffect,
  selectedNPCs,
  setSelectedNPCs,
  calcAttr,
  handleDecreaseUltima,
  handleIncreaseUltima,
  npcRef,
  isMobile,
  addLog,
  openLogs,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [open, setOpen] = useState(false);
  const [numTargets, setNumTargets] = useState(1);
  const [error, setError] = useState("");
  const [useMp, setUseMp] = useState(true);
  const [clickedData, setClickedData] = useState({});

  if (!selectedNPC) return null;

  const generateButtonLabel = (attack) => {
    const attributeMap = {
      dexterity: "DEX",
      insight: "INS",
      might: "MIG",
      will: "WLP",
    };

    // Determine the source and correct attribute keys
    let source, attrKey1, attrKey2;

    if (attack.weapon) {
      source = attack.weapon;
      attrKey1 = "att1";
      attrKey2 = "att2";
    } else if (attack.spell) {
      source = attack.spell;
      attrKey1 = "attr1";
      attrKey2 = "attr2";
    } else {
      source = attack;
      attrKey1 = "attr1";
      attrKey2 = "attr2";
    }

    // Extract attributes
    const attr1 = source?.[attrKey1];
    const attr2 = source?.[attrKey2];

    if (!attr1 || !attr2) return "Invalid Attack"; // Handle missing attributes

    const translatedAttribute1 = `${t(attributeMap[attr1])} d${
      selectedNPC.attributes[attr1]
    }`;
    const translatedAttribute2 = `${t(attributeMap[attr2])} d${
      selectedNPC.attributes[attr2]
    }`;

    return `【${translatedAttribute1} + ${translatedAttribute2}】`;
  };

  const damageTypeLabels = {
    physical: "physical_damage",
    wind: "air_damage",
    bolt: "bolt_damage",
    dark: "dark_damage",
    earth: "earth_damage",
    fire: "fire_damage",
    ice: "ice_damage",
    light: "light_damage",
    poison: "poison_damage",
  };

  const attributes = {
    dexterity: calcAttr("Slow", "Enraged", "dexterity", selectedNPC),
    insight: calcAttr("Dazed", "Enraged", "insight", selectedNPC),
    might: calcAttr("Weak", "Poisoned", "might", selectedNPC),
    will: calcAttr("Shaken", "Poisoned", "will", selectedNPC),
  };

  const maxTargets =
    clickedData.maxTargets && clickedData.maxTargets > 0
      ? clickedData.maxTargets
      : 1;

  const handleConfirmSpell = () => {
    const finalMpCost = clickedData.mp * numTargets;

    if (useMp && finalMpCost > selectedNPC?.combatStats?.currentMp) {
      setError("Not enough MP!");
      return;
    }

    setOpen(false);
    setError("");

    if (useMp) {
      handleUseMP(finalMpCost);
    }
    if (clickedData.type === "offensive") {
      // Roll the attack
      const {
        diceResults,
        totalHitScore,
        damage,
        isCriticalFailure,
        isCriticalSuccess,
      } = rollAttack(clickedData, "spell");
      // log the spell
      addLog(
        "combat_sim_log_spell_offensive_roll",
        "--isSpell--", 
        {
          npcName: selectedNPC.name,
          spellName: clickedData.name,
          targets: numTargets,
          dice1: diceResults.attribute1,
          dice2: diceResults.attribute2,
          extraMagic: calcMagic(selectedNPC) !== 0 ? " + " +calcMagic(selectedNPC) : "",
          totalHitScore: totalHitScore,
          hr: damage
        }
      )

      if (isCriticalFailure) {
        setTimeout(() => {
          addLog("combat_sim_log_crit_failure", selectedNPC.name);
        }, 100);
      }

      if (isCriticalSuccess) {
        setTimeout(() => {
          addLog("combat_sim_log_crit_success", selectedNPC.name);
        }, 100);
      }

      openLogs();
    } else {
      addLog(
        "combat_sim_log_spell_use",
        selectedNPC.name,
        clickedData.name,
        numTargets
      );

      openLogs();
    }
  };

  const handleAttack = (attack, attackType) => {
    // Roll the attack
    const {
      diceResults,
      totalHitScore,
      damage,
      hr,
      isCriticalFailure,
      isCriticalSuccess,
    } = rollAttack(attack, attackType);

    // Add the attack to the log
    addLog(
      "combat_sim_log_attack",
      "--isAttack--",
      {
        npcName: selectedNPC.name,
        attackName: attack.name,
        range: attackType === "attack" ? attack.range : attack.weapon.range,
        damageType: attackType === "attack" ? attack.type : attack.weapon.type,
        dice1: diceResults.attribute1,
        dice2: diceResults.attribute2,
        prec: calcPrecision(attack, selectedNPC) !== 0 ?
            " + " + calcPrecision(attack, selectedNPC) : "",
        totalHitScore,        
        hr,
        extraDamage: calcDamage(attack, selectedNPC),
        damage,
      }
    );

    if (isCriticalFailure) {
      setTimeout(() => {
        addLog("combat_sim_log_crit_failure", selectedNPC.name);
      }, 100);
    }

    if (isCriticalSuccess) {    
      setTimeout(() => {
        addLog("combat_sim_log_crit_success", selectedNPC.name);
      }, 100);
    }

    openLogs();
  };

  function handleUseMP(mpCost) {
    // Update the selectedNPC and selectedNPCs
    setSelectedNPC((prev) => ({
      ...prev,
      combatStats: {
        ...prev.combatStats,
        currentMp: prev.combatStats.currentMp - mpCost,
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                currentMp: npc.combatStats.currentMp - mpCost,
              },
            }
          : npc
      )
    );
  }

  const rollAttack = (attack, attackType) => {
    const message = `Rolling ${attack.name}.`;
    console.log(message);

    let attribute1, attribute2, extraDamage, extraPrecision, type;

    if (attackType === "weapon") {
      // For weapon attacks
      const { att1, att2 } = attack.weapon;
      attribute1 = attributes[att1];
      attribute2 = attributes[att2];
      extraDamage = calcDamage(attack, selectedNPC);
      extraPrecision = calcPrecision(attack, selectedNPC);
      type = attack.weapon.type;
    } else if (attackType === "spell") {
      // For spells
      const { attr1, attr2 } = attack;
      attribute1 = attributes[attr1];
      attribute2 = attributes[attr2];
      extraDamage = 0;
      extraPrecision = calcMagic(selectedNPC);
      type = "spell";
    } else {
      // For base attacks
      const { attr1, attr2 } = attack;
      attribute1 = attributes[attr1];
      attribute2 = attributes[attr2];
      extraDamage = calcDamage(attack, selectedNPC);
      extraPrecision = calcPrecision(attack, selectedNPC);
      type = attack.type;
    }

    if (attribute1 === undefined || attribute2 === undefined) {
      // Handle the case where attributes are not defined
      console.error("Attributes not defined");
      return;
    }

    // Simulate rolling the dice for each attribute
    const rollDice = (attribute) => Math.floor(Math.random() * attribute) + 1;
    const roll1 = rollDice(attribute1);
    const roll2 = rollDice(attribute2);

    // Check for critical success / failure
    const isCriticalSuccess = roll1 === roll2 && roll1 >= 6 && roll2 >= 6;
    const isCriticalFailure = roll1 === 1 && roll2 === 1;

    // Update dice results state
    const diceResults = { attribute1: roll1, attribute2: roll2 };

    // Calculate results
    const totalHitScore = roll1 + roll2 + extraPrecision;
    let baseDamage = Math.max(roll1, roll2);

    let damage = 0;
    if (type !== "nodmg") {
      damage = baseDamage + extraDamage;
    }

    return {
      diceResults,
      totalHitScore,
      damage,
      hr: baseDamage,
      isCriticalSuccess,
      isCriticalFailure,
    };
  };

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
    display: "inline",
    unwrapDisallowed: true,
  });

  const handleTabChange = (_, newIndex) => setTabIndex(newIndex);

  const renderTabs = (
    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      variant="fullWidth"
      sx={{
        minHeight: 40,
        "& .Mui-selected": {
          // Selected tab
          color: isDarkMode ? secondary : primary,
        },
        "& .MuiTab-root": {
          // Unselected tab
          color: isDarkMode ? "white" : "black",
        },
      }}
    >
      <Tab
        iconPosition="start"
        icon={<Description fontSize="small" />}
        label={!isMobile && t("combat_sim_sheet")}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
      <Tab
        iconPosition="start"
        icon={<Favorite fontSize="small" />}
        label={!isMobile && t("combat_sim_stats")}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
      <Tab
        iconPosition="start"
        icon={<Casino fontSize="small" />}
        label={!isMobile && t("combat_sim_rolls")}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
      <Tab
        iconPosition="start"
        icon={<Edit fontSize="small" />}
        label={!isMobile && t("combat_sim_notes")}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
    </Tabs>
  );

  const content = (
    <>
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #ccc",
            paddingBottom: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              flexShrink: 0,
              letterSpacing: 1,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {selectedNPC.name}
          </Typography>
          <Tooltip
            title={t("Close")}
            placement="left"
            enterDelay={500}
            enterNextDelay={500}
          >
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
          </Tooltip>
        </Box>
      )}

      {!isMobile && renderTabs}

      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
        {tabIndex === 0 && (
          <NpcPretty
            npc={selectedNPC}
            npcImage={selectedNPC.imgurl}
            collapse={true}
            study={selectedStudy}
            ref={npcRef}
          />
        )}
        {tabIndex === 1 && (
          <StatsTab
            selectedNPC={selectedNPC}
            calcHP={calcHP}
            calcMP={calcMP}
            handleOpen={handleOpen}
            toggleStatusEffect={toggleStatusEffect}
            handleDecreaseUltima={handleDecreaseUltima}
            handleIncreaseUltima={handleIncreaseUltima}
            isMobile={isMobile}
          />
        )}
        {tabIndex === 2 && (
          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            {[
              ...(selectedNPC?.attacks || []).map((attack) => ({
                type: "Attack",
                data: attack,
                extra: attack.special?.length
                  ? attack.special.join("\n\n")
                  : null,
                icon:
                  attack.range === "distance" ? (
                    <DistanceIcon />
                  ) : (
                    <MeleeIcon />
                  ),
              })),
              ...(selectedNPC?.weaponattacks || []).map((wattack) => ({
                type: "Weapon Attack",
                data: wattack,
                extra: wattack.special?.length
                  ? wattack.special.join("\n\n")
                  : null,
                icon:
                  wattack.weapon.range === "distance" ? (
                    <DistanceIcon />
                  ) : (
                    <MeleeIcon />
                  ),
              })),
              ...(selectedNPC?.spells || []).map((spell) => ({
                type: "Spell",
                data: spell,
                extra: spell.effect || null,
                icon: <SpellIcon />,
              })),
            ].map(({ type, data, extra, icon }, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "stretch", // Ensure all children stretch vertically
                  borderBottom: "1px solid #ddd",
                  py: 1,
                  minHeight: 80,
                }}
              >
                {/* Icon Section */}
                <Box
                  sx={{ display: "flex", alignItems: "center", minWidth: 25 }}
                >
                  {icon}
                </Box>

                {/* Divider */}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 1, my: -1 }}
                />

                {/* Text Section */}
                <Box sx={{ flexGrow: 1, px: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {data.name}{" "}
                    {type === "Spell" && data.type === "offensive" && (
                      <OffensiveSpellIcon />
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      ml:
                        type === "Spell" && data.type !== "offensive" ? 0 : -1,
                    }}
                  >
                    {/* Attacks & Weapon Attacks */}
                    {(type === "Attack" || type === "Weapon Attack") && (
                      <>
                        <strong>{generateButtonLabel(data)}</strong>
                        {calcPrecision(data, selectedNPC) > 0 &&
                          `+${calcPrecision(data, selectedNPC)} `}
                        {data.type !== "nodmg" && (
                          <>
                            <strong>
                              <Diamond />【
                              {t("HR") + " + " + calcDamage(data, selectedNPC)}
                              】
                            </strong>
                            {data.type === "physical" ? (
                              <span>
                                <StyledMarkdown
                                  allowedElements={["strong"]}
                                  unwrapDisallowed={true}
                                >
                                  {t(
                                    damageTypeLabels[
                                      type === "Attack"
                                        ? data.type
                                        : data.weapon.type
                                    ]
                                  )}
                                </StyledMarkdown>
                              </span>
                            ) : (
                              <span style={{ textTransform: "lowercase" }}>
                                <StyledMarkdown
                                  allowedElements={["strong"]}
                                  unwrapDisallowed={true}
                                >
                                  {t(
                                    damageTypeLabels[
                                      type === "Attack"
                                        ? data.type
                                        : data.weapon.type
                                    ]
                                  )}
                                </StyledMarkdown>
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* Spells */}
                    {type === "Spell" && (
                      <>
                        {data.type === "offensive" && (
                          <>
                            <strong>{generateButtonLabel(data)}</strong>
                            {calcMagic(selectedNPC) > 0 &&
                              `+${calcMagic(selectedNPC)} `}
                            <Diamond />
                          </>
                        )}{" "}
                        {data.mp} MP <Diamond /> {data.target} <Diamond />{" "}
                        {data.duration}
                      </>
                    )}
                  </Typography>

                  {extra && (
                    <Box sx={{ maxWidth: "80%", overflowWrap: "break-word" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="div"
                        sx={{ whiteSpace: "pre-wrap", my: -1 }}
                      >
                        <StyledMarkdown>{extra}</StyledMarkdown>
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Roll Button Section */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "stretch",
                    my: -1,
                    mx: -2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (type === "Spell" && data.maxTargets >= 0) {
                        setClickedData(data);
                        setOpen(true);
                      } else {
                        // Roll directly if there's no target selection
                        handleAttack(
                          data,
                          type === "Attack"
                            ? "attack"
                            : type === "Weapon Attack"
                            ? "weapon"
                            : "spell"
                        );
                      }
                    }}
                    sx={{
                      color: "#fff",
                      minWidth: 40,
                      width: 40,
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 0,
                    }}
                  >
                    <CasinoIcon />
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
        {tabIndex === 3 && (
          <NotesTab
            selectedNPC={selectedNPC}
            selectedNPCs={selectedNPCs}
            setSelectedNPCs={setSelectedNPCs}
          />
        )}
      </Box>

      {tabIndex === 0 && (
        <Box
          sx={{
            borderTop: "1px solid " + theme.palette.divider,
            paddingTop: 1,
            display: "flex",
            justifyContent: "center",
            marginBottom: 1,
          }}
        >
          <Select
            value={selectedStudy}
            onChange={handleStudyChange}
            size="small"
            sx={{
              // when selected, change border color
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: isDarkMode ? "#fff" : "primary",
              },
            }}
          >
            <MenuItem value={0}>{t("combat_sim_study")}</MenuItem>
            <MenuItem value={1}>7+</MenuItem>
            <MenuItem value={2}>10+</MenuItem>
            <MenuItem value={3}>13+</MenuItem>
          </Select>
          <Tooltip title="Download Sheet" placement="bottom">
            <Button
              color={isDarkMode ? "white" : "primary"}
              aria-label="download"
              onClick={downloadImage}
            >
              <Download />
            </Button>
          </Tooltip>
        </Box>
      )}

      {!isMobile && (
        <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
      )}

      {/* Target Selection Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
          {t("combat_sim_select_n_targets")}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 1,
          }}
        >
          <Select
            fullWidth
            value={numTargets}
            onChange={(e) => setNumTargets(e.target.value)}
            error={!!error}
            sx={{
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: isDarkMode ? "#fff" : "primary",
              },
            }}
          >
            {[...Array(maxTargets)].map((_, i) => {
              const targetCount = i + 1;
              const cost = targetCount * clickedData.mp;
              return (
                <MenuItem
                  key={targetCount}
                  value={targetCount}
                  disabled={cost > selectedNPC?.combatStats?.currentMp}
                >
                  {t("Target")} x {targetCount} / {t("MP") +": "+ cost}
                </MenuItem>
              );
            })}
          </Select>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </DialogContent>
        <DialogActions sx={{ width: "100%", justifyContent: "center" }}>
          <Button
            onClick={() => {
              setOpen(false);
              setError("");
            }}
            variant="outlined"
            color={isDarkMode ? "white" : "primary"}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleConfirmSpell}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, textTransform: "uppercase", px: 3 }}
          >
            {t("Roll")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return isMobile ? (
    <Dialog
      open={!!selectedNPC}
      onClose={() => setSelectedNPC(null)}
      fullScreen
    >
      <DialogTitle
        variant="h4"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          letterSpacing: 1,
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {selectedNPC.name}
        <IconButton onClick={() => setSelectedNPC(null)}>
          <Close />
        </IconButton>
      </DialogTitle>
      {renderTabs}
      <DialogContent dividers>{content}</DialogContent>
      <DialogActions
        sx={{ width: "100%", justifyContent: "center", padding: 0 }}
      >
        <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
      </DialogActions>
    </Dialog>
  ) : (
    <Box
      sx={{
        width: "30%",
        bgcolor: isDarkMode ? "#333333" : "#ffffff",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {content}
    </Box>
  );
};

export default NPCDetail;

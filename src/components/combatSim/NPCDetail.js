import React from "react";
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
  isMobile,
}) => {
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
      sx={{ minHeight: 40 }}
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
              ...(
                selectedNPC?.spells?.filter(
                  (spell) => spell.type === "offensive"
                ) || []
              ).map((spell) => ({
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
                    {data.name} {type === "Spell" && <OffensiveSpellIcon />}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: -1 }}>
                    <strong>{generateButtonLabel(data)}</strong>

                    {/* Attacks & Weapon Attacks */}
                    {(type === "Attack" || type === "Weapon Attack") && (
                      <>
                        {calcPrecision(data, selectedNPC) > 0 &&
                          `+${calcPrecision(data, selectedNPC)} `}
                        {data.type !== "nodmg" && (
                          <>
                            <strong>
                              <Diamond />【
                              {t("HR") + " + " + calcDamage(data, selectedNPC)}
                              】{" "}
                            </strong>
                            {data.type === "physical" ? (
                              <span>
                                <StyledMarkdown
                                  allowedElements={["strong"]}
                                  unwrapDisallowed={true}
                                >
                                  {t(damageTypeLabels[data.type])}
                                </StyledMarkdown>
                              </span>
                            ) : (
                              <span style={{ textTransform: "lowercase" }}>
                                <StyledMarkdown
                                  allowedElements={["strong"]}
                                  unwrapDisallowed={true}
                                >
                                  {t(damageTypeLabels[data.type])}
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
                        {calcMagic(selectedNPC) > 0 &&
                          `+${calcMagic(selectedNPC)} `}
                        <Diamond /> {data.mp} MP <Diamond /> {data.target}{" "}
                        <Diamond /> {data.duration}
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
                      if (window.electron) {
                        window.electron.alert("Rolls still in development.");
                      } else {
                        alert("Rolls still in development.");
                      }
                      console.log(`Rolling for ${data.name}`);
                    }}
                    sx={{
                      color: "#fff",
                      minWidth: 40,
                      width: 40,
                      height: "100%", // Stretch vertically
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
            borderTop: "1px solid #ccc",
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
          >
            <MenuItem value={0}>{t("combat_sim_study")}</MenuItem>
            <MenuItem value={1}>7+</MenuItem>
            <MenuItem value={2}>10+</MenuItem>
            <MenuItem value={3}>13+</MenuItem>
          </Select>
          <Tooltip title="Download Sheet" placement="bottom">
            <Button
              color="primary"
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
        bgcolor: "#fff",
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

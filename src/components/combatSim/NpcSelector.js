import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  IconButton,
  Drawer,
  Tooltip,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material"; // Import Material-UI icons
import {
  GiRaiseZombie,
  GiWolfHead,
  GiRobotGolem,
  GiEvilBat,
  GiFire,
  GiSwordwoman,
  GiGooeyDaemon,
  GiRose,
} from "react-icons/gi";

function rankText(rank) {
  const rankMap = {
    soldier: "Soldier",
    elite: "Elite",
    companion: "Companion",
    groupveichle: "Group Vehicle",
    champion1: "Champion (1)",
    champion2: "Champion (2)",
    champion3: "Champion (3)",
    champion4: "Champion (4)",
    champion5: "Champion (5)",
    champion6: "Champion (6)",
  };

  return rankMap[rank] || "";
};

export default function NpcSelector({
  isMobile,
  npcList = [], // Default to an empty array if npcList is not passed
  handleSelectNPC,
  npcDrawerOpen,
  setNpcDrawerOpen,
}) {
  const [filterText, setFilterText] = useState("");
  const [filterField, setFilterField] = useState("name");
  const [isExpanded, setIsExpanded] = useState(true);

  // Filtered NPC list based on selected filter field and text
  const filteredNpcList = npcList.filter((npc) => {
    if (filterText === "") return true;
    const value = npc[filterField]
      ? npc[filterField].toString().toLowerCase()
      : "";
    return value.includes(filterText.toLowerCase());
  });

  return isMobile ? (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={() => setNpcDrawerOpen(true)}
      >
        Select NPCs
      </Button>
      <Drawer
        anchor="left"
        open={npcDrawerOpen}
        onClose={() => setNpcDrawerOpen(false)}
      >
        <Box sx={{ width: 250, padding: 2 }}>
          <Typography variant="h5">NPC Selector</Typography>

          {/* Filter Controls */}
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ marginBottom: 2 }}
              size="small"
            />
            <FormControl fullWidth>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                label="Filter By"
                size="small"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="lvl">Level</MenuItem>
                <MenuItem value="species">Species</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* NPC List */}
          <Box sx={{ maxHeight: "80vh", overflowY: "auto" }}>
            {filteredNpcList.map((npc) => (
              <React.Fragment key={npc.id}>
                <Button
                  sx={{ display: "block" }}
                  onClick={() => handleSelectNPC(npc.id)}
                >
                  {npc.name}
                </Button>
                <Divider />
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Drawer>
    </>
  ) : (
    <Box
      sx={{
        width: isExpanded ? "20%" : "60px", // Collapsed view
        bgcolor: "#fff",
        padding: 2,
        height: "100%",
        transition: "width 0.3s ease-in-out", // Smooth transition
      }}
    >
      {isExpanded && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between", // Ensure title and button are on opposite ends
            alignItems: "center",
            borderBottom: "1px solid #ccc",
            marginBottom: 2,
            paddingBottom: 1,
          }}
        >
          <Typography variant="h5">NPC Selector</Typography>
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ padding: 0 }}
          >
            <KeyboardArrowLeft />
          </IconButton>
        </Box>
      )}

      {!isExpanded && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ padding: 0 }}
          >
            <KeyboardArrowRight />
          </IconButton>
        </Box>
      )}

      {isExpanded && (
        <>
          {/* Filter Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginBottom: 2,
            }}
          >
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ width: "60%" }}
            />
            <FormControl size="small" sx={{ width: "35%" }}>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                label="Filter By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="lvl">Level</MenuItem>
                <MenuItem value="species">Species</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* NPC List */}
          <Box sx={{ maxHeight: "68vh", overflowY: "auto" }}>
            <List sx={{ height: "calc(68vh - 40px)", overflowY: "auto" }}>
              {filteredNpcList.map((npc) => (
                <Box key={npc.id}>
                  <ListItem
                    button
                    onClick={() => handleSelectNPC(npc.id)}
                    sx={{ padding: "5px 10px" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h5" fontWeight={"bold"}>
                            {npc.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontFamily: "Antonio" }}
                            >
                              <Tooltip title={npc.species}>
                              {npc.species === "Beast" && (
                                
                                  <GiWolfHead />
                                
                              )}
                              {npc.species === "Construct" && <GiRobotGolem />}
                              {npc.species === "Demon" && <GiEvilBat />}
                              {npc.species === "Elemental" && <GiFire />}
                              {npc.species === "Humanoid" && <GiSwordwoman />}
                              {npc.species === "Undead" && <GiRaiseZombie />}
                              {npc.species === "Plant" && <GiRose />}
                              {npc.species === "Monster" && <GiGooeyDaemon />}
                              </Tooltip>
                              {" | "}
                              Level: {npc.lvl}
                              {npc.rank && " | " + rankText(npc.rank)}
                            </Typography>
                          </>
                        }
                      />
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );
}

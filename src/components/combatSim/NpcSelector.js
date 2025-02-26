import React, { useState } from "react";
import {
  Drawer,
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
  Typography as MuiTypography,
} from "@mui/material";

export default function NpcSelector({
  isMobile,
  npcDrawerOpen,
  setNpcDrawerOpen,
  npcList,
  handleSelectNPC,
}) {
  const [filterText, setFilterText] = useState("");
  const [filterField, setFilterField] = useState("name");

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
      <Button variant="contained" onClick={() => setNpcDrawerOpen(true)}>
        Select NPCs
      </Button>
      <Drawer
        anchor="left"
        open={npcDrawerOpen}
        onClose={() => setNpcDrawerOpen(false)}
      >
        <Box sx={{ width: 250, padding: 2 }}>
          <Typography variant="h6">NPC Selector</Typography>

          {/* Filter Controls */}
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <FormControl fullWidth>
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
          <Box sx={{ maxHeight: "80vh", overflowY: "auto" }}>
            {filteredNpcList.map((npc) => (
              <Button
                key={npc.id}
                sx={{ display: "block", margin: "10px 0" }}
                onClick={() => handleSelectNPC(npc.id)}
              >
                {npc.name}
              </Button>
            ))}
          </Box>
        </Box>
      </Drawer>
    </>
  ) : (
    <Box
      sx={{
        width: "30%",
        bgcolor: "#fff",
        padding: 2,
        height: "100%",
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: 2, borderBottom: "1px solid #ccc", paddingBottom: 1 }}>
        NPC Selector
      </Typography>

      {/* Filter Controls - In a row with smaller sizes */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}
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
              <ListItem button onClick={() => handleSelectNPC(npc.id)}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <ListItemText
                    primary={npc.name}
                    secondary={
                      <MuiTypography variant="body2" color="text.secondary">
                        Level: {npc.lvl}
                      </MuiTypography>
                    }
                  />
                </Box>
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );
}

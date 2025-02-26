import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getEncounterList } from "../../utility/db";
import Layout from "../../components/Layout";
import {
  Typography,
  Box,
  CircularProgress,
  Drawer,
  Button,
  useMediaQuery,
  TextField,
  Icon,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Edit } from "@mui/icons-material";

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
  const [selectedNPCs, setSelectedNPCs] = useState([]);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [npcDrawerOpen, setNpcDrawerOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null); // To track last saved time
  const [isEditing, setIsEditing] = useState(false); // State to handle editing mode for encounter name
  const [encounterName, setEncounterName] = useState(""); // State for the encounter name
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchEncounter = async () => {
      const encounters = await getEncounterList();
      const foundEncounter = encounters.find((e) => e.id + "" === id);
      setEncounter(foundEncounter);
      setEncounterName(foundEncounter?.name || ""); // Set initial name
      setLoading(false);
    };
    fetchEncounter();
  }, [id]);

  const handleSaveState = () => {
    const currentTime = new Date();
    setLastSaved(currentTime);
    // Add logic to save encounter state to IndexedDB here
  };

  const timeAgo = lastSaved
    ? `${Math.floor((new Date() - lastSaved) / 1000 / 60)} minutes ago`
    : "Not saved yet";

  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  const handleSaveEncounterName = () => {
    if (encounterName.trim() === "") {
      return; // Don't save if the name is empty
    }
    setIsEditing(false);
    // Here you can add logic to save the new encounter name to your database or state.
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#fff",
          padding: 2,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isEditing ? (
            <TextField
              value={encounterName}
              onChange={handleEncounterNameChange}
              onBlur={handleBlur} // Save on blur (focus loss)
              onKeyDown={handleKeyPress} // Listen for the Enter key
              autoFocus
              variant="standard"
              error={encounterName.trim() === ""}
              helperText={
                encounterName.trim() === "" ? "Name cannot be empty" : ""
              }
            />
          ) : (
            <>
              <Typography
                variant="h4"
                onClick={handleEditClick}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {encounterName}
              </Typography>
              <Icon
                onClick={handleEditClick}
                sx={{
                  cursor: "pointer",
                }}
              >
                <Edit />
              </Icon>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {timeAgo !== "Not saved yet" && (
            <Typography variant="body2">Last saved: {timeAgo}</Typography>
          )}
          <Button variant="contained" color="primary" onClick={handleSaveState}>
            Save
          </Button>
        </Box>
      </Box>

      {/* Three Columns: NPC Selector, Selected NPCs, NPC Sheet */}
      <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 205px)" }}>
        {/* NPC Selector */}
        {isMobile ? (
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
                {/* Lista di NPC disponibili (da implementare) */}
              </Box>
            </Drawer>
          </>
        ) : (
          <Box
            sx={{
              width: "30%",
              bgcolor: "#fff",
              padding: 2,
              overflowY: "auto",
              height: "100%",
            }}
          >
            <Typography variant="h5">NPC Selector</Typography>
            {/* Lista di NPC disponibili (da implementare) */}
          </Box>
        )}

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
          {/* Lista di NPC selezionati (da implementare) */}
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
          {selectedNPC ? (
            <Typography>{selectedNPC.name}</Typography>
          ) : (
            <Typography>Select an NPC</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

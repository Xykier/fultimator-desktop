import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getEncounterList,
  addEncounter,
  deleteEncounter,
} from "../../utility/db";
import DeleteIcon from "@mui/icons-material/Delete";
import Layout from "../../components/Layout";
import { useTheme } from "@mui/material/styles";
import CustomHeaderAlt from "../../components/common/CustomHeaderAlt";
import { SportsMartialArts, NavigateNext } from "@mui/icons-material";

const MAX_ENCOUNTERS = 10;

export default function CombatSimulatorEncounters() {
  return (
    <Layout fullWidth={true}>
      <CombatSimEncounters />
    </Layout>
  );
}

const CombatSimEncounters = () => {
  const [encounters, setEncounters] = useState([]);
  const [encounterName, setEncounterName] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, []);

  const fetchData = async () => {
    const encounterList = await getEncounterList();
    encounterList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setEncounters(encounterList);
  };

  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  const handleSaveEncounter = async () => {
    if (!encounterName || encounters.length >= MAX_ENCOUNTERS) return;

    const newEncounter = {
      name: encounterName,
      round: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addEncounter(newEncounter);
    fetchData();
    setEncounterName("");
  };

  const handleDeleteEncounter = async (id) => {
    await deleteEncounter(id);
    fetchData();
  };

  const handleNavigateToEncounter = (id) => {
    navigate(`/combat-sim/${id}`);
  };

  return (
    <Box sx={{ padding: 3, maxWidth: "1200px", margin: "auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: "14px",
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
        }}
      >
        <CustomHeaderAlt
          headerText={"Combat Simulator"}
          icon={<SportsMartialArts fontSize="large" />}
        />
        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
          <Typography variant="h6" gutterBottom>
            Create a New Encounter
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Encounter Name"
                variant="outlined"
                fullWidth
                value={encounterName}
                onChange={handleEncounterNameChange}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSaveEncounter}
                disabled={!encounterName || encounters.length >= MAX_ENCOUNTERS}
                sx={{ height: "100%" }}
              >
                Save Encounter
              </Button>
            </Grid>
          </Grid>
          <Typography variant="h5" mt={2}>
            Saved Encounters ({encounters.length}/{MAX_ENCOUNTERS})
          </Typography>
        </div>
      </Paper>

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {encounters.map((encounter) => (
          <Grid item xs={12} sm={6} md={4} key={encounter.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                transition: "0.3s",
                "&:hover": { boxShadow: 8, transform: "scale(1.03)" },
                cursor: "pointer",
                position: "relative", // Ensure positioning context for the icon
              }}
              onClick={() => handleNavigateToEncounter(encounter.id)}
            >
              <CardContent sx={{ paddingBottom: "10px" }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  {encounter.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Created: {new Date(encounter.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last Updated: {new Date(encounter.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions
                sx={{ justifyContent: "flex-end", padding: "10px 16px" }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEncounter(encounter.id);
                  }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>

              {/* Always visible indicator on the right, centered vertically */}
              <Box
                sx={{
                  position: "absolute",
                  right: 8, // Small distance from the right edge
                  top: "50%",
                  transform: "translateY(-50%)", // Centers vertically
                  color: "rgba(0, 0, 0, 0.54)", // Subtle color
                }}
              >
                <NavigateNext fontSize="medium" />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

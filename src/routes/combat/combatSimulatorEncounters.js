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
  Tooltip,
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
import { t } from "../../translation/translate";

const MAX_ENCOUNTERS = 3;

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
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
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
        elevation={isDarkMode ? 6 : 3} // Higher elevation in dark mode
        sx={{
          p: "14px",
          borderRadius: "8px",
          border: `2px solid ${theme.palette.secondary.main}`,
          backgroundColor: theme.palette.background.paper,          
        }}
      >
        <CustomHeaderAlt
          headerText={t("combat_sim_title")}
          icon={<SportsMartialArts fontSize="large" />}
        />
        <div style={{ paddingLeft: 10, paddingRight: 10 }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            {t("combat_sim_new_encounter")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label={t("combat_sim_encounter_name")}
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
                {t("combat_sim_create_encounter")}
              </Button>
            </Grid>
          </Grid>
          <Typography variant="h5" mt={2} color="text.primary">
            {t("combat_sim_saved_encounters")} ({encounters.length}/
            {MAX_ENCOUNTERS})
          </Typography>
        </div>
      </Paper>

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {encounters.map((encounter) => (
          <Grid item xs={12} sm={6} md={4} key={encounter.id}>
            <Card
              sx={{
                backgroundColor: isDarkMode ?  "#292929" : theme.palette.background.paper,
                borderRadius: 3,
                boxShadow: isDarkMode ? 6 : 4,
                transition: "0.3s",
                "&:hover": {
                  boxShadow: isDarkMode ? 10 : 8,
                  transform: "scale(1.03)",
                },
                cursor: "pointer",
                color: theme.palette.text.primary,
                position: "relative",
              }}
              onClick={() => handleNavigateToEncounter(encounter.id)}
            >
              <CardContent sx={{ paddingBottom: "10px" }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "text.primary" }}
                >
                  {encounter.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("combat_sim_created")}:{" "}
                  {new Date(encounter.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("combat_sim_last_updated")}:{" "}
                  {new Date(encounter.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions
                sx={{ justifyContent: "flex-end", padding: "10px 16px" }}
              >
                <Tooltip
                  title={t("Delete")}
                  enterDelay={300}
                  leaveDelay={200}
                  enterNextDelay={300}
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
                </Tooltip>
              </CardActions>

              {/* Always visible indicator on the right, centered vertically */}
              <Box
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: theme.palette.text.secondary,
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

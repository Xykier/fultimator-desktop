import { Link as RouterLink } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import HelpFeedbackDialog from "../../components/appbar/HelpFeedbackDialog";

import {
  IconButton,
  Tooltip,
  Typography,
  Grid,
  Snackbar,
  Paper,
  TextField,
  Button,
  InputAdornment,
  Alert,
  AlertTitle,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Layout from "../../components/Layout";
import {
  ContentCopy,
  Delete,
  Edit,
  HistoryEdu,
  Badge,
  Star,
  BugReport,
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";
import PlayerCard from "../../components/player/playerSheet/PlayerCard";
import SearchIcon from "@mui/icons-material/Search";
import Export from "../../components/Export";
import { addPc, getPcs, deletePc } from "../../utility/db";
import { globalConfirm } from "../../utility/globalConfirm";
import { validateCharacter } from "../../utility/validateJson";

export default function PlayerGallery() {
  return (
    <Layout>
      <Personal />
    </Layout>
  );
}

function Personal() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [direction, setDirection] = useState("ascending");
  const [open, setOpen] = useState(false);
  const [isBugDialogOpen, setIsBugDialogOpen] = useState(false);
  const [pcs, setPcs] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPcs();
  }, []);

  const fetchPcs = async () => {
    try {
      const pcsData = await getPcs();
      setPcs(pcsData);
    } catch (error) {
      console.error("Failed to fetch PCs", error);
    }
  };

  const filteredList = pcs
    ? pcs
        .filter((item) => {
          if (
            name !== "" &&
            !item.name.toLowerCase().includes(name.toLowerCase())
          ) {
            return false;
          }
          return true;
        })
        .sort((item1, item2) => {
          if (direction === "ascending") {
            return item1.name.localeCompare(item2.name);
          } else {
            return item2.name.localeCompare(item1.name);
          }
        })
    : [];

  const addPlayer = async () => {
    const data = {
      uid: "local",
      name: "-",
      lvl: 5,
      info: {
        pronouns: "",
        identity: "",
        theme: "",
        origin: "",
        bonds: [],
        description: "",
        fabulapoints: 3,
        exp: 0,
        zenit: 0,
        imgurl: "",
      },
      attributes: {
        dexterity: 8,
        insight: 8,
        might: 8,
        willpower: 8,
      },
      stats: {
        hp: {
          max: 45,
          current: 45,
        },
        mp: {
          max: 45,
          current: 45,
        },
        ip: {
          max: 6,
          current: 6,
        },
      },
      statuses: {
        slow: false,
        dazed: false,
        enraged: false,
        weak: false,
        shaken: false,
        poisoned: false,
        dexUp: false,
        insUp: false,
        migUp: false,
        wlpUp: false,
      },
      classes: [],
      weapons: [],
      armor: [],
      notes: [],
      modifiers: {
        hp: 0,
        mp: 0,
        ip: 0,
        def: 0,
        mdef: 0,
        init: 0,
        meleePrec: 0,
        rangedPrec: 0,
        magicPrec: 0,
      },
    };

    try {
      await addPc(data);
      // Fetch updated list
      const pcsData = await getPcs();
      setPcs(pcsData);
    } catch (error) {
      console.error("Error adding player:", error);
      setSnackbarMessage("Failed to add player");
      setSnackbarOpen(true);
    }
  };

  const getNextId = async () => {
    const pcs = await getPcs();
    if (pcs.length === 0) return 1;
    const maxId = Math.max(...pcs.map((pc) => pc.id));
    return maxId + 1;
  };

  const handleFileUpload = async (jsonData) => {
    try {
      // Validate the JSON data
      if (!validateCharacter(jsonData)) {
        console.error("Invalid character data.");
        const alertMessage = t("Invalid character JSON data") + ".";
        if (window.electron) {
          window.electron.alert(alertMessage);
        } else {
          alert(alertMessage);
        }
        return;
      }

      // Add additional properties before uploading
      jsonData.id = await getNextId();
      jsonData.uid = "local";

      // Upload the character data
      await addPc(jsonData);

      // Fetch and update the list of PCs
      fetchPcs();
    } catch (error) {
      console.error("Error uploading PC from JSON:", error);
    }
  };

  const copyPlayer = (player) => async () => {
    const data = { ...player, uid: "local" };
    delete data.id;
    data.published = false;

    const message = t("Are you sure you want to copy?");
    const confirmed = await globalConfirm(message);

    if (confirmed) {
      try {
        await addPc(data);
        const pcsData = await getPcs();
        const newPc = pcsData[pcsData.length - 1];
        if (newPc) {
          window.location.hash = `/pc-gallery/${newPc.id}`;
        }
      } catch (error) {
        console.error("Error copying player:", error);
        setSnackbarMessage("Failed to copy player");
        setSnackbarOpen(true);
      }
    }
  };

  const deletePlayer = (player) => async () => {
    const message = t("Are you sure you want to delete?");
    const confirmed = await globalConfirm(message);

    if (confirmed) {
      try {
        await deletePc(player.id);
        const pcsData = await getPcs();
        setPcs(pcsData);
      } catch (error) {
        console.error("Error deleting player:", error);
        setSnackbarMessage("Failed to delete player");
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBugDialogClose = () => {
    setIsBugDialogOpen(false);
  };

  return (
    <>
      <Alert
        icon={<Star />}
        severity="success"
        variant="filled"
        sx={{
          mb: 3,
          backgroundColor: "rgb(22, 163, 74)", // emerald-600 equivalent
          "& .MuiAlert-icon": {
            color: "inherit",
          },
        }}
      >
        <Box>
          <AlertTitle sx={{ fontSize: "1.1rem", fontWeight: "bold", mb: 1 }}>
            {t("Help us improve the Character Designer!")}
          </AlertTitle>
          <Typography variant="body2" color="inherit" sx={{ mb: 2 }}>
            {t(
              "We value your input on this new feature. Please take a moment to complete our quick survey and share your thoughts. Your feedback will directly influence future updates and enhancements."
            )}
          </Typography>
          <Button
            href="https://forms.gle/4kfWcrZYRcoAErew5"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            sx={{
              backgroundColor: "rgb(220, 252, 231)",
              color: "rgb(22, 163, 74)",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            {t("TAKE QUICK SURVEY")}
          </Button>
        </Box>
      </Alert>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Paper sx={{ width: "100%", px: 2, py: 1 }}>
          <Grid container spacing={1} sx={{ py: 1 }} justifyContent="center">
            <Grid
              item
              xs={12}
              md={3}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <TextField
                id="outlined-basic"
                label={t("Search by Player Name")}
                variant="outlined"
                size="small"
                fullWidth
                value={name}
                onChange={(evt) => {
                  setName(evt.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid
              item
              xs={4}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="direction">{t("Direction:")}</InputLabel>
                <Select
                  labelId="direction"
                  id="select-direction"
                  value={direction}
                  label="direction:"
                  onChange={(evt, val2) => {
                    setDirection(evt.target.value);
                  }}
                >
                  <MenuItem value={"ascending"}>{t("Ascending")}</MenuItem>
                  <MenuItem value={"descending"}>{t("Descending")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{}}
              alignItems="center"
              justifyContent="center"
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<HistoryEdu />}
                onClick={addPlayer}
              >
                {t("Create Player")}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => fileInputRef.current.click()}
              >
                {t("Add PC from JSON")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const result = JSON.parse(reader.result);
                        handleFileUpload(result);
                      } catch (err) {
                        console.error("Error parsing JSON:", err);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                style={{ display: "none" }}
              />
            </Grid>
          </Grid>
        </Paper>
      </div>
      <Grid container spacing={1} sx={{ py: 1 }}>
        {filteredList.map((player, index) => (
          <Grid
            item
            xs={12}
            md={6}
            alignItems="center"
            justifyContent="center"
            key={index}
            sx={{ marginBottom: "20px" }}
          >
            <PlayerCard
              player={player}
              setPlayer={null}
              isEditMode={false}
              sx={{ marginBottom: 1 }}
              isCharacterSheet={false}
            />
            <div style={{ marginTop: "3px" }}>
              <Tooltip title={t("Copy")}>
                <IconButton onClick={copyPlayer(player)}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Edit")}>
                <IconButton
                  component={RouterLink}
                  to={`/pc-gallery/${player.id}`}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Delete")}>
                <IconButton onClick={deletePlayer(player)}>
                  <Delete />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Player Sheet")}>
                <IconButton
                  component={RouterLink}
                  to={`/character-sheet/${player.id}`}
                >
                  <Badge />
                </IconButton>
              </Tooltip>
              <Export name={`${player.name}`} dataType="pc" data={player} />
            </div>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            startIcon={<BugReport />}
            sx={{ marginTop: "5rem" }}
            onClick={() => setIsBugDialogOpen(true)}
          >
            {t("Report a Bug")}
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ height: "10vh" }} />
      <HelpFeedbackDialog
        open={isBugDialogOpen}
        onClose={handleBugDialogClose}
        userEmail={"local"}
        userUUID={"local"}
        title={"Report a Bug"}
        placeholder="Please describe the bug. Please leave a message in english!"
        onSuccess={null}
        webhookUrl={process.env.REACT_APP_DISCORD_REPORT_BUG_WEBHOOK_URL}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message={t("Copied to Clipboard!")}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Failed") ? "error" : "success"}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

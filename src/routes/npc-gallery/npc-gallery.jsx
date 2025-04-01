import {
  Link as RouterLink,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  IconButton,
  Tooltip,
  Grid,
  Snackbar,
  CircularProgress,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
  Typography,
} from "@mui/material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import {
  ContentCopy,
  Delete,
  Download,
  Edit,
  HistoryEdu,
  UploadFile,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate } from "../../translation/translate";
import { addNpc, getNpcs, deleteNpc } from "../../utility/db";
import { globalConfirm } from "../../utility/globalConfirm";
import { validateNpc } from "../../utility/validateJson";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ExportAllNPCs from "../../components/common/ExportAllNPCs";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export default function NpcGallery() {
  return (
    <Layout>
      <Personal />
    </Layout>
  );
}

function Personal() {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [rank, setRank] = useState(searchParams.get("rank") || "");
  const [species, setSpecies] = useState(searchParams.get("species") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "name");
  const [direction, setDirection] = useState(
    searchParams.get("direction") || "ascending"
  );
  const [tagSort, setTagSort] = useState(searchParams.get("tagSort") || null);
  const [tagSearch] = useState("");
  const [collapse, setCollapse] = useState(false);
  const [personalList, setPersonalList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredParams, setFilteredParams] = useState(location.search || "");

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchNpcs();
  }, []);

  // Create wrapper functions for state updates that also update URL
  const updateName = (value) => {
    setName(value);
    updateUrlParams({ name: value });
  };

  const updateRank = (value) => {
    setRank(value);
    updateUrlParams({ rank: value });
  };

  const updateSpecies = (value) => {
    setSpecies(value);
    updateUrlParams({ species: value });
  };

  const updateSort = (value) => {
    setSort(value);
    updateUrlParams({ sort: value });
  };

  const updateDirection = (value) => {
    setDirection(value);
    updateUrlParams({ direction: value });
  };

  const updateTagSort = (value) => {
    setTagSort(value);
    updateUrlParams({ tagSort: value });
  };

  // Function to update URL parameters
  const updateUrlParams = (updatedParams) => {
    if (loading) return; // Don't update URL while loading

    const currentParams = {
      name,
      rank,
      species,
      tagSort,
      sort,
      direction,
      ...updatedParams,
    };

    // Build the query string
    const queryString = new URLSearchParams(
      Object.entries(currentParams).reduce((acc, [key, value]) => {
        if (value) acc[key] = value; // Only include non-empty values
        return acc;
      }, {})
    ).toString();

    // Set it for later use
    setFilteredParams(queryString);

    // Update the URL with the new query string
    navigate(`${location.pathname}?${queryString}`, {
      replace: true,
    });
  };

  const clearSearchFilters = () => {
    // Reset all filter states
    setName("");
    setRank("");
    setSpecies("");
    setTagSort(null);
    setSort("name"); // Reset to default sort
    setDirection("ascending"); // Reset to default direction

    // Clear the URL parameters
    setFilteredParams("");

    // Update the URL to remove all query parameters
    navigate(location.pathname, { replace: true });
  };

  const fetchNpcs = async () => {
    const npcs = await getNpcs();
    setPersonalList(npcs);
    setLoading(false);
  };

  const tagCounts = personalList
    ? personalList.reduce((accumulator, npc) => {
        if (npc.tags) {
          npc.tags.forEach((tag) => {
            if (tag.name) {
              const tagName = tag.name.toUpperCase(); // Convert to UpperCase
              accumulator[tagName] = (accumulator[tagName] || 0) + 1;
            }
          });
        }
        return accumulator;
      }, {})
    : {};

  const sortedTags = Object.keys(tagCounts).sort(
    (a, b) => tagCounts[b] - tagCounts[a]
  );

  const handleAddNpc = async () => {
    const data = {
      name: "-",
      species: "Beast",
      lvl: 5,
      imgurl: "",
      uid: "local", // Placeholder for user ID, can be changed as needed
      attributes: {
        dexterity: 8,
        might: 8,
        will: 8,
        insight: 8,
      },
      attacks: [],
      affinities: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addNpc(data);
    fetchNpcs();
  };

  const handleCopyNpc = (npc) => async () => {
    const message = t("Are you sure you want to copy?");
    const confirmed = await globalConfirm(message);

    if (confirmed) {
      try {
        const data = {
          ...npc,
          uid: "local",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        delete data.id;

        // Add the NPC to the database
        await addNpc(data);

        // After adding, fetch the updated list and find the newly added NPC
        const npcs = await getNpcs();
        const newNpc = npcs[npcs.length - 1]; // Assuming the new NPC is the last one in the list

        if (newNpc) {
          window.location.hash = `/npc-gallery/${newNpc.id}`;
        }
      } catch (error) {
        console.error("Error copying NPC:", error);
      }
    }
  };
  const handleDeleteNpc = (npc) => async () => {
    const message = t("Are you sure you want to delete?");
    const confirmed = await globalConfirm(message);

    if (confirmed) {
      await deleteNpc(npc.id);
      fetchNpcs();
    }
  };

  let npcCounter = 0; // Local counter to avoid fetching from DB repeatedly
  const getNextId = async () => {
    if (npcCounter === 0) {
      const npcs = await getNpcs();
      npcCounter =
        npcs.length === 0 ? 1 : Math.max(...npcs.map((npc) => npc.id)) + 1;
    } else {
      npcCounter++; // Ensure each ID is unique within this upload session
    }
    return npcCounter;
  };

  const handleFileUpload = async (jsonData) => {
    try {
      // Validate the JSON data
      if (!validateNpc(jsonData)) {
        console.error("Invalid NPC data:", jsonData);
        const alertMessage = t("Invalid NPC JSON data") + ".";
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

      // Upload the NPC data
      await addNpc(jsonData);

      // Fetch and update the list of NPCs
      fetchNpcs();
    } catch (error) {
      console.error("Error uploading NPC from JSON:", error);
    }
  };

  const handleFileSelection = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) {
      console.warn("No files selected.");
      return;
    }

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = JSON.parse(reader.result);

          // Assign a unique ID
          result.id = await getNextId();

          await handleFileUpload(result); // Ensures sequential execution
        } catch (err) {
          console.error(`Error parsing JSON from ${file.name}:`, err);
        }
      };

      reader.onerror = () => {
        console.error(`Error reading file ${file.name}:`, reader.error);
      };

      reader.readAsText(file);
      await new Promise((resolve) => (reader.onloadend = resolve)); // Wait for each file to finish processing
    }

    event.target.value = "";
  };

  const handleClose = () => {
    setOpen(false);
  };

  const isMobile = window.innerWidth < 900;

  const err = null;

  if (err?.code === "resource-exhausted") {
    return (
      <Paper elevation={3} sx={{ marginBottom: 5, padding: 4 }}>
        {t(
          "Apologies, fultimator has reached its read quota at the moment, please try again tomorrow. (Around 12-24 hours)"
        )}
      </Paper>
    );
  }

  const filteredList = personalList
    ? personalList
        .filter((item) => {
          // Filter based on name, species, and rank
          if (
            name !== "" &&
            !item.name.toLowerCase().includes(name.toLowerCase())
          )
            return false;

          if (
            tagSearch !== "" &&
            !item.tags?.some(
              (tag) =>
                tag.name &&
                tag.name.toLowerCase().includes(tagSearch.toLowerCase())
            )
          )
            return false;

          if (species && item.species !== species) return false;

          if (rank && item.rank !== rank) return false;

          return true;
        })
        .sort((item1, item2) => {
          // Sort based on selected sort and direction
          const handleDateSort = (date1, date2) => {
            const d1 = date1 ? new Date(date1) : new Date(0); // Treat missing dates as the earliest
            const d2 = date2 ? new Date(date2) : new Date(0); // Treat missing dates as the earliest
            return d1 - d2;
          };

          if (direction === "ascending") {
            if (sort === "name") {
              return item1.name.localeCompare(item2.name);
            } else if (sort === "level") {
              return item1.lvl - item2.lvl;
            } else if (sort === "createdAt") {
              return handleDateSort(item1.createdAt, item2.createdAt);
            } else if (sort === "updatedAt") {
              return handleDateSort(item1.updatedAt, item2.updatedAt);
            }
          } else {
            if (sort === "name") {
              return item2.name.localeCompare(item1.name);
            } else if (sort === "level") {
              return item2.lvl - item1.lvl;
            } else if (sort === "createdAt") {
              return handleDateSort(item2.createdAt, item1.createdAt); // Reverse for descending
            } else if (sort === "updatedAt") {
              return handleDateSort(item2.updatedAt, item1.updatedAt); // Reverse for descending
            }
          }
        })
        .filter((item) => {
          // Filter based on selected tag sort
          if (
            tagSort !== "" &&
            tagSort !== null &&
            !item.tags?.some(
              (tag) => tag.name.toUpperCase() === tagSort.toUpperCase()
            )
          ) {
            return false;
          }
          return true;
        })
    : [];

  return (
    <>
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
                label={t("Adversary Name")}
                variant="outlined"
                size="small"
                fullWidth
                value={name}
                onChange={(evt) => {
                  updateName(evt.target.value);
                }}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={2}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <Autocomplete
                fullWidth
                size="small"
                options={sortedTags}
                value={tagSort}
                onChange={(event, newValue) => {
                  updateTagSort(newValue);
                }}
                filterOptions={(options, { inputValue }) => {
                  const inputValueUpper = inputValue.toUpperCase();
                  return options.filter((option) =>
                    option.toUpperCase().includes(inputValueUpper)
                  );
                }}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("Tag Search")}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid
              item
              xs={6}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="rank">{t("Rank:")}</InputLabel>
                <Select
                  labelId="rank"
                  id="select-rank"
                  value={rank}
                  label={t("Rank:")}
                  onChange={(evt) => {
                    updateRank(evt.target.value);
                  }}
                >
                  <MenuItem value={""}>{t("All")}</MenuItem>
                  <MenuItem value={"soldier"}>{t("Soldier")}</MenuItem>
                  <MenuItem value={"elite"}>{t("Elite")}</MenuItem>
                  <MenuItem value={"champion1"}>{t("Champion(1)")}</MenuItem>
                  <MenuItem value={"champion2"}>{t("Champion(2)")}</MenuItem>
                  <MenuItem value={"champion3"}>{t("Champion(3)")}</MenuItem>
                  <MenuItem value={"champion4"}>{t("Champion(4)")}</MenuItem>
                  <MenuItem value={"champion5"}>{t("Champion(5)")}</MenuItem>
                  <MenuItem value={"champion6"}>{t("Champion(6)")}</MenuItem>
                  <MenuItem value={"companion"}>{t("Companion")}</MenuItem>
                  <MenuItem value={"groupvehicle"}>
                    {t("Group Vehicle")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={6}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="rank">{t("Species:")}</InputLabel>
                <Select
                  labelId="species"
                  id="select-species"
                  value={species}
                  label={t("Species:")}
                  onChange={(evt) => {
                    updateSpecies(evt.target.value);
                  }}
                >
                  <MenuItem value={""}>{t("All")}</MenuItem>
                  <MenuItem value={"Beast"}>{t("Beast")}</MenuItem>
                  <MenuItem value={"Construct"}>{t("Construct")}</MenuItem>
                  <MenuItem value={"Demon"}>{t("Demon")}</MenuItem>
                  <MenuItem value={"Elemental"}>{t("Elemental")}</MenuItem>
                  <MenuItem value={"Humanoid"}>{t("Humanoid")}</MenuItem>
                  <MenuItem value={"Monster"}>{t("Monster")}</MenuItem>
                  <MenuItem value={"Plant"}>{t("Plant")}</MenuItem>
                  <MenuItem value={"Undead"}>{t("Undead")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={5}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="sort">{t("Sort:")}</InputLabel>
                <Select
                  labelId="sort"
                  id="select-sort"
                  value={sort}
                  label={t("Sort:")}
                  onChange={(evt) => {
                    updateSort(evt.target.value);
                  }}
                >
                  <MenuItem value={"name"}>{t("Name")}</MenuItem>
                  <MenuItem value={"level"}>{t("Level")}</MenuItem>
                  <MenuItem value={"createdAt"}>{t("creation_date")}</MenuItem>
                  <MenuItem value={"updatedAt"}>{t("updated_date")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={5}
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
                  onChange={(evt) => {
                    updateDirection(evt.target.value);
                  }}
                >
                  <MenuItem value={"ascending"}>{t("Ascending")}</MenuItem>
                  <MenuItem value={"descending"}>{t("Descending")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={2}
              md={1}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <Tooltip title={t("clear_search_filters")} placement="top">
                <Button
                  onClick={clearSearchFilters}
                  variant="outlined"
                  fullWidth
                  sx={{
                    height: "100%",
                    padding: 0, // Remove default padding
                    minWidth: 0, // Ensure the button doesn't enforce a minimum width
                  }}
                >
                  <DeleteSweepIcon />
                </Button>
              </Tooltip>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<HistoryEdu />}
                onClick={handleAddNpc}
              >
                {t("Create NPC")}
              </Button>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: "flex" }}>
              <ExportAllNPCs
                npcs={filteredList?.length > 0 ? filteredList : []}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                fullWidth
                onClick={() => fileInputRef.current?.click()}
              >
                {t("Add NPC from JSON")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                multiple
                onChange={handleFileSelection}
                style={{ display: "none" }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              alignItems="center"
              sx={{ display: "flex" }}
            >
              <Button
                variant="outlined"
                fullWidth
                startIcon={collapse ? <ExpandLess /> : <ExpandMore />}
                onClick={() => {
                  setCollapse(!collapse);
                }}
              >
                {collapse ? t("Collapse") : t("Expand")}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" align="center" mt={1} mb={-1}>
                {t("filtered_npc_count") + " " + filteredList?.length}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </div>

      {isMobile ? (
        <div>
          {filteredList?.map((npc, i) => {
            return (
              <Npc
                key={i}
                npc={npc}
                copyNpc={handleCopyNpc}
                deleteNpc={handleDeleteNpc}
                collapseGet={collapse}
              />
            );
          })}
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "row-reverse", rowGap: 30 }}
        >
          <div style={{ marginLeft: 10, width: "50%" }}>
            {filteredList?.map((npc, i) => {
              if (i % 2 === 0) return "";
              return (
                <Npc
                  key={i}
                  npc={npc}
                  copyNpc={handleCopyNpc}
                  deleteNpc={handleDeleteNpc}
                  collapseGet={collapse}
                  filterParams={filteredParams}
                />
              );
            })}
          </div>
          <div style={{ marginRight: 10, width: "50%" }}>
            {filteredList?.map((npc, i) => {
              if (i % 2 !== 0) return "";
              return (
                <Npc
                  key={i}
                  npc={npc}
                  copyNpc={handleCopyNpc}
                  deleteNpc={handleDeleteNpc}
                  collapseGet={collapse}
                  filterParams={filteredParams}
                />
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 50,
        }}
      >
        {loading && <CircularProgress />}
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message={t("Copied to Clipboard!")}
      />
    </>
  );
}

function Npc({ npc, copyNpc, deleteNpc, collapseGet, filterParams }) {
  const { t } = useTranslate();
  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);

  const [collapse, setCollapse] = useState(false);

  useEffect(() => {
    setCollapse(collapseGet);
  }, [collapseGet]);

  function expandAndDownloadImage() {
    setCollapse(true);
    setTimeout(downloadImage, 100);
  }

  return (
    <Grid item xs={12} md={12} sx={{ marginBottom: 3 }}>
      <NpcPretty
        npc={npc}
        ref={ref}
        npcImage={npc.imgurl}
        collapse={collapse}
        onClick={() => {
          setCollapse(!collapse);
        }}
      />
      {/* <NpcUgly npc={npc} /> */}
      <Tooltip title={t("Copy")}>
        <IconButton onClick={copyNpc(npc)}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Edit")}>
        <RouterLink
          to={`/npc-gallery/${npc.id}${
            filterParams
              ? filterParams.startsWith("?")
                ? filterParams
                : `?${filterParams}`
              : ""
          }`}
        >
          <IconButton>
            <Edit />
          </IconButton>
        </RouterLink>
      </Tooltip>
      <Tooltip title={t("Delete")}>
        <IconButton onClick={deleteNpc(npc)}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Download as Image")}>
        <IconButton
          onClick={() => {
            expandAndDownloadImage();
          }}
        >
          <Download />
        </IconButton>
      </Tooltip>
      <Export name={`${npc.name}`} dataType="npc" data={npc} />
    </Grid>
  );
}

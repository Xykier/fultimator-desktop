import { Link as RouterLink } from "react-router-dom";

import {
  query,
  orderBy,
  collection,
  where,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import {
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
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
} from "@mui/material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
// import NpcUgly from "../../components/npc/Ugly";
import {
  ContentCopy,
  Delete,
  Share,
  Download,
  Edit,
  HistoryEdu,
} from "@mui/icons-material";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate } from "../../translation/translate";
import { addNpc, getNpcs, deleteNpc, updateNpc } from "../../utility/db";

export default function NpcGallery() {
  return (
    <Layout>
      <Personal />
    </Layout>
  );
}

function Personal({ user }) {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [sort, setSort] = useState("name");
  const [direction, setDirection] = useState("ascending");
  const [species, setSpecies] = useState("");
  const [tagSearch] = useState("");
  const [tagSort, setTagSort] = useState(null);
  const [collapse, setCollapse] = useState(false);
  const [personalList, setPersonalList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNpcs();
  }, []);

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
    };
    await addNpc(data);
    fetchNpcs();
  };

  /*const copyNpc = function (npc) {
    return async function () {
      const data = Object.assign({}, npc);
      data.uid = user.uid;
      delete data.id;
      data.published = false;

      //const ref = collection(firestore, "npc-personal");
      const ref = null;
      if (window.confirm("Are you sure you want to copy?")) {
        addDoc(ref, data)
          .then(function (docRef) {
            window.location.href = `/npc-gallery/${docRef.id}`;
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
      }
    };
  };*/

  const handleCopyNpc = (npc) => async () => {
    const data = { ...npc, uid: "local" };
    delete data.id;
    await addNpc(data);
    fetchNpcs();
  };

  const handleDeleteNpc = (npc) => async () => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteNpc(npc.id);
      fetchNpcs();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const shareNpc = async (id) => {
    const baseUrl = window.location.href.replace(/\/[^/]+$/, "");
    const fullUrl = `${baseUrl}/npc-gallery/${id}`;
    await navigator.clipboard.writeText(fullUrl);
    setOpen(true);
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
        // eslint-disable-next-line array-callback-return
        .sort((item1, item2) => {
          // Sort based on selected sort and direction
          if (direction === "ascending") {
            if (sort === "name") {
              return item1.name.localeCompare(item2.name);
            } else if (sort === "level") {
              return item1.lvl - item2.lvl;
            } else if (sort === "publishedAt") {
              return (
                (item1.publishedAt ? item1.publishedAt : 0) -
                (item2.publishedAt ? item2.publishedAt : 0)
              );
            }
          } else {
            if (sort === "name") {
              return item2.name.localeCompare(item1.name);
            } else if (sort === "level") {
              return item2.lvl - item1.lvl;
            } else if (sort === "publishedAt") {
              return (
                (item2.publishedAt ? item2.publishedAt : 0) -
                (item1.publishedAt ? item1.publishedAt : 0)
              );
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
                  setName(evt.target.value);
                }}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={3}
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
                  setTagSort(newValue);
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
                    label="Tag Search"
                    variant="outlined"
                    fullWidth
                  />
                )}
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
                <InputLabel id="rank">{t("Rank:")}</InputLabel>
                <Select
                  labelId="rank"
                  id="select-rank"
                  value={rank}
                  label={t("Rank:")}
                  onChange={(evt, val2) => {
                    setRank(evt.target.value);
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
              xs={4}
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
                  onChange={(evt, val2) => {
                    setSpecies(evt.target.value);
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
              xs={4}
              md={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ display: "flex" }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="sort">Sort:</InputLabel>
                <Select
                  labelId="sort"
                  id="select-sort"
                  value={sort}
                  label="Sort:"
                  onChange={(evt, val2) => {
                    setSort(evt.target.value);
                  }}
                >
                  <MenuItem value={"name"}>Name</MenuItem>
                  <MenuItem value={"level"}>Level</MenuItem>
                  <MenuItem value={"publishedAt"}>Published Date</MenuItem>
                </Select>
              </FormControl>
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
                <InputLabel id="direction">Direction:</InputLabel>
                <Select
                  labelId="direction"
                  id="select-direction"
                  value={direction}
                  label="direction:"
                  onChange={(evt, val2) => {
                    setDirection(evt.target.value);
                  }}
                >
                  <MenuItem value={"ascending"}>Ascending</MenuItem>
                  <MenuItem value={"descending"}>Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={4}
              md={2}
              alignItems="center"
              sx={{ display: "flex" }}
            >
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setCollapse(!collapse);
                }}
              >
                {collapse ? t("Collapse") : t("Expand")}
              </Button>
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
                onClick={handleAddNpc}
              >
                {t("Create NPC")}
              </Button>
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
                shareNpc={shareNpc}
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
                  shareNpc={shareNpc}
                  collapseGet={collapse}
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
                  shareNpc={shareNpc}
                  collapseGet={collapse}
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

function Npc({ npc, copyNpc, deleteNpc, shareNpc, collapseGet }) {
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
        <IconButton component={RouterLink} to={`/npc-gallery/${npc.id}`}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Delete")}>
        <IconButton onClick={deleteNpc(npc)}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("Share URL")}>
        <IconButton onClick={() => shareNpc(npc.id)}>
          <Share />
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
      <Export name={`${npc.name}`} data={npc} />
    </Grid>
  );
}

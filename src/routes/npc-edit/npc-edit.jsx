import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Grid,
  Divider,
  Fab,
  Fade,
  Tooltip,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { Download, Save, ArrowUpward } from "@mui/icons-material";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import EditBasics from "../../components/npc/EditBasics";
import ExplainSkills from "../../components/npc/ExplainSkills";
import EditAttacks from "../../components/npc/EditAttacks";
import EditWeaponAttacks from "../../components/npc/EditWeaponAttacks";
import EditAffinities from "../../components/npc/EditAffinities";
import EditSpecial from "../../components/npc/EditSpecial";
import ExplainAffinities from "../../components/npc/ExplainAffinities";
import EditExtra from "../../components/npc/EditExtra";
import EditSpells from "../../components/npc/EditSpells";
import EditActions from "../../components/npc/EditActions";
import EditNotes from "../../components/npc/EditNotes";
import EditRareGear from "../../components/npc/EditRareGear";
import Probs from "../probs/probs";
import useDownloadImage from "../../hooks/useDownloadImage";
import Export from "../../components/Export";
import { useTranslate } from "../../translation/translate";
import CustomHeader from "../../components/common/CustomHeader";
import TagList from "../../components/TagList";
import { NpcProvider } from "../../components/npc/NpcContext";
import { getNpcs, updateNpc } from "../../utility/db";
import deepEqual from "deep-equal";

export default function NpcEdit() {
  const { t } = useTranslate(); // Translation hook
  const theme = useTheme(); // Theme hook for MUI
  const secondary = theme.palette.secondary.main; // Secondary color from theme
  const isSmallScreen = useMediaQuery("(max-width: 899px)"); // Media query hook for screen size

  let params = useParams(); // URL parameters hook
  const location = useLocation(); // Location hook for getting URL

  const npcId = parseInt(params.npcId, 10);
  const [showScrollTop, setShowScrollTop] = useState(true); // State for scroll-to-top button visibility

  // Scroll-to-top handler
  const handleMoveToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [npc, setNpc] = useState(null); // NPC state
  const [npcTemp, setNpcTemp] = useState(null); // Temporary NPC state
  const [isUpdated, setIsUpdated] = useState(false); // State for unsaved changes
  const [loadingIsUpdated, setLoadingIsUpdated] = useState(false);
  const isNpcUpdated = useMemo(() => !deepEqual(npcTemp, npc), [npcTemp, npc]);

  // Effect to fetch NPC data from IndexedDB
  useEffect(() => {
    const fetchNpc = async () => {
      const npcs = await getNpcs();
      const currentNpc = npcs.find((npc) => npc.id === npcId);
      setNpc(currentNpc);
      setNpcTemp(currentNpc ? { ...currentNpc } : null);
    };

    fetchNpc();
  }, [npcId]);

  useEffect(() => {
    if (npc) {
      // Perform a deep copy of the player object
      const updatedNpcTemp = JSON.parse(JSON.stringify(npc));
      setNpcTemp(updatedNpcTemp);
      setIsUpdated(false);
    }
  }, [npc]);

  useEffect(() => {
    setLoadingIsUpdated(true); // Start loading

    const timeoutId = setTimeout(() => {
      setIsUpdated(isNpcUpdated);

      // Small delay before stopping loading (improves UI smoothness)
      setTimeout(() => setLoadingIsUpdated(false), 10);
    }, 300); // Adjust delay as needed

    return () => clearTimeout(timeoutId); // Cleanup on dependency change
  }, [npcTemp, npc, isNpcUpdated]);

  // Handler for Ctrl+S to save NPC
  const handleCtrlS = useCallback(
    (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        updateNpc(npcTemp);
        setIsUpdated(false);
      }
    },
    [npcTemp]
  );

  // Effect for scroll, focus, and blur events, and keyboard shortcuts
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    const handleFocus = () => {
      setShowScrollTop(false);
    };

    const handleBlur = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    document.body.addEventListener("focus", handleFocus, true);
    document.body.addEventListener("blur", handleBlur, true);
    document.addEventListener("keydown", handleCtrlS);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("focus", handleFocus, true);
      document.body.removeEventListener("blur", handleBlur, true);
      document.removeEventListener("keydown", handleCtrlS);
    };
  }, [handleCtrlS]);

  useEffect(() => {
    // Change page title with npc name
    const originalTitle = document.title;
    document.title = npc?.name ? `${npc.name} | Fultimator` : "Fultimator";
    return () => {
      document.title = originalTitle;
    };
  }, [npc?.name]);

  // Download image hook and reference
  const prettyRef = useRef();
  const [downloadImage] = useDownloadImage(npc?.name, prettyRef);

  // Function to save NPC
  const saveNpc = useCallback(() => {
    // Add updatedAt timestamp to the NPC object
    const updatedNpc = { ...npcTemp, updatedAt: new Date().toISOString() };

    // Update the NPC
    updateNpc(updatedNpc);

    // Reset the update state and save the updated NPC to state
    setIsUpdated(false);
    setNpc(updatedNpc);
  }, [npcTemp]);

  // Check if the 'json' query parameter is true and return the JSON response
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get("json") === "true" && npc) {
    return <pre>{JSON.stringify(npc, null, 2)}</pre>;
  }

  if (!npcTemp) {
    return null;
  }

  // Function to download NPC as image
  function DownloadImage() {
    setTimeout(downloadImage, 100);
  }

  return (
    <NpcProvider npcData={npcTemp}>
      <Layout unsavedChanges={isUpdated}>
        {/* Main Grid Container */}
        <Grid container spacing={2}>
          {/* NPC Pretty Display (Left-side Grid Item) */}
          <Grid item xs={12} md={8}>
            <NpcPretty
              npc={npcTemp}
              ref={prettyRef}
              npcImage={npcTemp.imgurl}
              collapse={true}
            />
          </Grid>

          {/* Skills, Controls and Publish (Right-side Grid Item) */}
          <Grid item xs={12} md={4}>
            {/* Skill Points */}
            <ExplainSkills npc={npcTemp} />
            <Divider sx={{ my: 1 }} />

            {/* Download NPC Sheet Button */}
            <Tooltip title={t("Download as Image")}>
              <IconButton onClick={DownloadImage}>
                <Download />
              </IconButton>
            </Tooltip>

            {/* Export NPC Data */}
            <Export name={`${npc.name}`} dataType="npc" data={npc} />

            {/* Tags Section */}

            <Divider sx={{ my: 1 }} />
            <TagList npc={npcTemp} setNpc={setNpcTemp} />
            {/*TEST BUTTON <Button onClick={() => console.log(npcTemp)} variant="contained">Log Temp NPC Object</Button>*/}
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* NPC Edit Options for Creator */}

        {/* Edit Basic Information */}
        <Paper
          elevation={3}
          sx={{
            p: "15px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <EditBasics npc={npcTemp} setNpc={setNpcTemp} />
        </Paper>
        <Divider sx={{ my: 1 }} />

        {/* Edit Affinities and Bonuses */}
        <Paper
          elevation={3}
          sx={{
            p: "15px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomHeader
                type="top"
                headerText={t("Affinity")}
                showIconButton={false}
              />
              <ExplainAffinities npc={npcTemp} />
              <EditAffinities npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomHeader
                type={isSmallScreen ? "middle" : "top"}
                headerText={t("Bonuses")}
                showIconButton={false}
              />
              <EditExtra npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
          </Grid>
        </Paper>
        <Divider sx={{ my: 1 }} />

        {/* Edit Base Attacks and Weapon Attacks */}
        <Paper
          elevation={3}
          sx={{
            p: "15px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <EditAttacks npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
            <Grid item xs={12}>
              <EditWeaponAttacks npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
          </Grid>
        </Paper>
        <Divider sx={{ my: 1 }} />

        {/* Edit Spells */}
        <Paper
          elevation={3}
          sx={{
            p: "15px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <EditSpells npc={npcTemp} setNpc={setNpcTemp} />
        </Paper>
        <Divider sx={{ my: 1 }} />

        {/* Edit Extra Features */}
        <Paper
          elevation={3}
          sx={{
            p: "15px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <Grid container spacing={2}>
            {/* Edit Other Actions */}
            <Grid item xs={12} md={6}>
              <EditActions npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
            {/* Edit Special Rules */}
            <Grid item xs={12} md={6}>
              <EditSpecial npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
            {/* Edit Rare Gear */}
            <Grid item xs={12} md={6}>
              <EditRareGear npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
            {/* Edit Notes */}
            <Grid item xs={12} md={6}>
              <EditNotes npc={npcTemp} setNpc={setNpcTemp} />
            </Grid>
          </Grid>
        </Paper>
        <Divider sx={{ my: 1 }} />

        {/* Attack Chance Generator Section */}
        <Paper
          elevation={3}
          sx={{
            p: "15px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          <Probs />
        </Paper>
        <Divider sx={{ my: 2, mb: 20 }} />

        {/* Save Button, shown if there are unsaved changes */}
        {(loadingIsUpdated || isUpdated) && (
          <Grid
            style={{ position: "fixed", bottom: 65, right: 10, zIndex: 100 }}
          >
            <Fade in={true} timeout={300}>
              <Tooltip
                title={loadingIsUpdated ? "Checking..." : "Save"}
                placement="bottom"
              >
                <span>
                  <Fab
                    color="primary"
                    aria-label="save"
                    onClick={saveNpc}
                    disabled={loadingIsUpdated || !isUpdated} // Disable while loading
                    size="medium"
                    style={{ marginLeft: "5px" }}
                  >
                    {loadingIsUpdated ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <Save />
                    )}
                  </Fab>
                </span>
              </Tooltip>
            </Fade>
          </Grid>
        )}

        {/* Move to Top Button */}
        <Grid style={{ position: "fixed", bottom: 15, right: 10, zIndex: 100 }}>
          <Fade in={showScrollTop} timeout={300}>
            <Fab
              color="primary"
              aria-label="move-to-top"
              onClick={handleMoveToTop}
              size="medium"
            >
              <ArrowUpward />
            </Fab>
          </Fade>
        </Grid>
      </Layout>
    </NpcProvider>
  );
}

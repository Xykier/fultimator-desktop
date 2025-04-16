import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Link as LinkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  getRelatedNpcs,
  getNpcs,
  associateNpcWithCampaign,
  disassociateNpcFromCampaign,
} from "../../../utility/db";

import SearchbarFilter from "./npcsTab/SearchbarFilter";
import NpcCard from "./npcsTab/NpcCard";
import LinkNpcDialog from "./npcsTab/LinkNpcDialog";

const NpcsTab = ({ campaignId }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [allNpcs, setAllNpcs] = useState([]);
  const [associatedNpcIds, setAssociatedNpcIds] = useState([]);
  const [campaignNpcs, setCampaignNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("name");
  const [filterType, setFilterType] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [expandedNpcId, setExpandedNpcId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNpc, setSelectedNpc] = useState(null);

  // Load all NPCs and get associated NPCs
  useEffect(() => {
    const loadNpcs = async () => {
      setLoading(true);
      try {
        const relatedNpcs = await getRelatedNpcs(campaignId);
        setAssociatedNpcIds(relatedNpcs.map((npc) => npc.id));
        setCampaignNpcs(relatedNpcs);

        const allNpcsList = await getNpcs();
        setAllNpcs(allNpcsList);
        setError(null);
      } catch (err) {
        console.error("Error loading NPCs:", err);
        setError("Failed to load NPCs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadNpcs();
  }, [campaignId]);

  const handleAddExistingNpc = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearchText("");
  };

  const handleToggleNpc = async (npcId) => {
    try {
      if (associatedNpcIds.includes(npcId)) {
        await disassociateNpcFromCampaign(npcId, campaignId);
        setAssociatedNpcIds((prev) => prev.filter((id) => id !== npcId));
        setCampaignNpcs((prev) => prev.filter((npc) => npc.id !== npcId));
        showSnackbar("NPC removed from campaign", "info");
      } else {
        await associateNpcWithCampaign(npcId, campaignId);
        setAssociatedNpcIds((prev) => [...prev, npcId]);
        const npc = allNpcs.find((n) => n.id === npcId);
        if (npc) {
          setCampaignNpcs((prev) => [...prev, npc]);
          showSnackbar("NPC added to campaign", "success");
        }
      }
    } catch (error) {
      console.error("Error toggling NPC association:", error);
      showSnackbar("Failed to update NPC association", "error");
    }
  };

  const handleEditNpc = (npcId) => {
    navigate(`/npc-gallery/${npcId}`);
  };

  const handleExpandNpc = (npcId) => {
    setExpandedNpcId(expandedNpcId === npcId ? null : npcId);
  };

  const handleContextMenu = (event, npc) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX, mouseY: event.clientY }
        : null
    );
    setSelectedNpc(npc);
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
    setSelectedNpc(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterChange = (event, newValue) => {
    setFilterType(newValue);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const filteredNpcs = allNpcs.filter((npc) =>
    npc.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Apply sorting to campaign NPCs
  const sortedCampaignNpcs = [...campaignNpcs].sort((a, b) => {
    if (sortOrder === "name") return a.name.localeCompare(b.name);
    if (sortOrder === "level") return a.lvl - b.lvl;
    if (sortOrder === "species") return a.species.localeCompare(b.species);
    return 0;
  });

  // Apply filters to campaign NPCs
  const displayedNpcs = sortedCampaignNpcs.filter((npc) => {
    if (filterType === "all") return true;
    if (filterType === "friendly" && npc.alignment?.includes("Good"))
      return true;
    if (filterType === "hostile" && npc.alignment?.includes("Evil"))
      return true;
    if (filterType === "neutral" && npc.alignment?.includes("Neutral"))
      return true;
    return false;
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Campaign NPCs</Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<LinkIcon />}
              onClick={handleAddExistingNpc}
              sx={{ mr: 1 }}
            >
              Link NPC
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Search, sort, and filter controls */}
      {campaignNpcs.length > 0 && (
        <Grid item xs={12}>
          <SearchbarFilter
            searchText={searchText}
            setSearchText={setSearchText}
            sortOrder={sortOrder}
            handleSortChange={handleSortChange}
            filterType={filterType}
            handleFilterChange={handleFilterChange}
          />
        </Grid>
      )}

      {/* Loading state */}
      {loading && (
        <Grid item xs={12} sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading NPCs...
          </Typography>
        </Grid>
      )}

      {/* Error state */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        </Grid>
      )}

      {/* Empty state */}
      {!loading && !error && campaignNpcs.length === 0 && (
        <Grid item xs={12}>
          <Box
            sx={{
              py: 8,
              textAlign: "center",
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No NPCs in this campaign yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add NPCs to bring your campaign world to life
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<LinkIcon />}
                onClick={handleAddExistingNpc}
              >
                Link Existing NPC
              </Button>
            </Box>
          </Box>
        </Grid>
      )}

      {/* Display NPCs */}
      {!loading && !error && displayedNpcs.length > 0 && (
        <>
          {displayedNpcs.map((npc) => (
            <NpcCard
              key={npc.id}
              npc={npc}
              expandedNpcId={expandedNpcId}
              handleExpandNpc={handleExpandNpc}
              handleContextMenu={handleContextMenu}
            />
          ))}
        </>
      )}

      {/* NPC Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            if (selectedNpc) handleEditNpc(selectedNpc.id);
            handleContextMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit NPC</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedNpc) handleToggleNpc(selectedNpc.id);
            handleContextMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Remove from Campaign</ListItemText>
        </MenuItem>
      </Menu>

      {/* Link NPC Dialog */}
      <LinkNpcDialog
        open={open}
        handleClose={handleClose}
        searchText={searchText}
        setSearchText={setSearchText}
        filteredNpcs={filteredNpcs}
        associatedNpcIds={associatedNpcIds}
        handleToggleNpc={handleToggleNpc}
      />

      {/* Feedback snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default NpcsTab;

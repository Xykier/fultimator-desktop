import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateNpcCampaignAttitude, updateNpcCampaignFolder } from "../../../../utility/db";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Link as LinkIcon,
} from "@mui/icons-material";
import {
  getRelatedNpcs,
  getNpcs,
  associateNpcWithCampaign,
  disassociateNpcFromCampaign,
  getNpcFoldersForCampaign, // Import getNpcFoldersForCampaign
  addNpcFolder, // Import addNpcFolder
} from "../../../../utility/db";

import SearchbarFilter from "./SearchbarFilter";
import LinkNpcDialog from "./LinkNpcDialog";
import NpcFolderList from "./NpcFolderList";
import NpcList from "./NpcList";

const NpcsTabMain = ({ campaignId }) => {
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
  const [folders, setFolders] = useState([]); // State for NPC folders
  const [selectedFolderId, setSelectedFolderId] = useState(null); // State for selected folder
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [expandedNpcId, setExpandedNpcId] = useState(null);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false); // State for new folder dialog
  const [newFolderName, setNewFolderName] = useState(""); // State for new folder name

  const loadNpcs = async () => {
    setLoading(true);
    try {
      const relatedNpcs = await getRelatedNpcs(campaignId);
      setAssociatedNpcIds(relatedNpcs.map((npc) => npc.id));
      setCampaignNpcs(relatedNpcs);

      const allNpcsList = await getNpcs();
      setAllNpcs(allNpcsList);

      // Load folders for the campaign
      try {
        const foldersList = await getNpcFoldersForCampaign(campaignId);
        setFolders(foldersList);
      } catch (folderErr) {
        console.error("Error loading NPC folders:", folderErr);
        setError("Failed to load NPC folders. Please try again.");
      }

      setError(null);
    } catch (err) {
      console.error("Error loading NPCs:", err);
      setError("Failed to load NPCs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Function to handle setting NPC attitude
  const handleSetAttitude = async (npcId, newAttitude) => {
    try {
      await updateNpcCampaignAttitude(npcId, campaignId, newAttitude);
      showSnackbar(`NPC attitude set to ${newAttitude}`, "success");
      await loadNpcs(); // Reload NPCs to reflect the change
    } catch (err) {
      console.error("Error updating NPC attitude:", err);
      showSnackbar("Failed to update NPC attitude", "error");
    }
  };

  const filteredNpcsForDialog = allNpcs.filter((npc) => // Renamed to avoid conflict
    npc.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Apply search filter first
  const searchedCampaignNpcs = campaignNpcs.filter(npc =>
    npc.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Apply sorting to searched campaign NPCs
  const sortedCampaignNpcs = [...searchedCampaignNpcs].sort((a, b) => {
    if (sortOrder === "name") return a.name.localeCompare(b.name);
    if (sortOrder === "level") return (a.lvl || 0) - (b.lvl || 0); // Handle potential undefined lvl
    if (sortOrder === "species") return (a.species || '').localeCompare(b.species || ''); // Handle potential undefined species
    return 0;
  });

  // Apply folder, attitude/villain filters to sorted campaign NPCs
  const displayedNpcs = sortedCampaignNpcs.filter(npc => {
    // Folder filter
    if (selectedFolderId) {
      if (selectedFolderId === null && npc.folderId !== null) return false;
      if (selectedFolderId !== null && npc.folderId !== selectedFolderId) return false;
    }

    //Attitude filter
    if (filterType === "all") return true;
    if (filterType === "friendly") return npc.attitude === "friendly";
    if (filterType === "hostile") return npc.attitude === "hostile";
    if (filterType === "neutral") return npc.attitude === "neutral";
    if (filterType === "villains") {
      return ["minor", "major", "supreme"].includes(npc.villain); // Assuming villain is still on the base NPC object
    }
    return true;
  });

  const handleCreateFolder = async () => {
    try {
      await addNpcFolder({ campaignId: campaignId, name: newFolderName });
      // Refresh folders list
      const foldersList = await getNpcFoldersForCampaign(campaignId);
      setFolders(foldersList);
      setNewFolderDialogOpen(false);
      setNewFolderName("");
      showSnackbar("Folder created successfully", "success");
    } catch (error) {
      console.error("Error creating folder:", error);
      showSnackbar("Failed to create folder", "error");
    }
  };

  const handleMoveNpcToFolder = async (npcId, folderId) => {
    try {
      await updateNpcCampaignFolder(npcId, campaignId, folderId);
      showSnackbar("NPC moved to folder successfully", "success");
      await loadNpcs();
    } catch (error) {
      console.error("Error moving NPC to folder:", error);
      showSnackbar("Failed to move NPC to folder", "error");
    }
  };

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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LinkIcon />}
              onClick={handleAddExistingNpc}
              sx={{ mr: 1 }}
            >
              Link NPC
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setNewFolderDialogOpen(true)}
            >
              Create Folder
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

      {/* Display NPC Folders */}
      <Grid item xs={12}>
        <NpcFolderList
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
        />
      </Grid>

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

      {/* Display NPCs or Empty State for the current filter */}
      {!loading && !error && campaignNpcs.length > 0 && (
        <NpcList
          displayedNpcs={displayedNpcs}
          expandedNpcId={expandedNpcId}
          handleExpandNpc={handleExpandNpc}
          handleEditNpc={handleEditNpc}
          handleToggleNpc={handleToggleNpc}
          handleSetAttitude={handleSetAttitude}
          filterType={filterType}
          folders={folders}
          handleMoveNpcToFolder={handleMoveNpcToFolder}
        />
      )}

      {/* Link NPC Dialog */}
      <LinkNpcDialog
        open={open}
        handleClose={handleClose}
        searchText={searchText} // Keep original search text for dialog
        setSearchText={setSearchText} // Keep original setter for dialog
        filteredNpcs={filteredNpcsForDialog} // Use the specific filtered list for the dialog
        associatedNpcIds={associatedNpcIds}
        handleToggleNpc={handleToggleNpc} // Toggle association logic
      />

      {/* Create New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Folder Name"
            type="text"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder}>Create</Button>
        </DialogActions>
      </Dialog>

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

export default NpcsTabMain;
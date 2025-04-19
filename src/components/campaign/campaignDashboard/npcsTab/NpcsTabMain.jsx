import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  updateNpcCampaignAttitude,
  updateNpcCampaignFolder,
  updateNpcFolder, // Import updateNpcFolder
} from "../../../../utility/db";
import { sortNpcs, filterNpcs } from "../../../../utility/npcUtils";
import {
  Grid,
  Paper,
} from "@mui/material";
import {
  getRelatedNpcs,
  getNpcs,
  associateNpcWithCampaign,
  disassociateNpcFromCampaign,
  getNpcFoldersForCampaign, // Import getNpcFoldersForCampaign
  addNpcFolder, // Import addNpcFolder
  deleteNpcFolder,
} from "../../../../utility/db";
import NpcsTabHeader from "./NpcsTabHeader";
import SearchbarFilter from "./SearchbarFilter";
import NpcList from "./NpcList";
import FolderNameDialogComponent from "./FolderNameDialogComponent";
import DeleteFolderDialogComponent from "./DeleteFolderDialogComponent";
import FolderExplorer from "./FolderExplorer";
import LinkNpcDialog from "./LinkNpcDialog";
import EmptyNpcsList from "./EmptyNpcsList";
import NpcListLoading from "./NpcListLoading";
import NpcListError from "./NpcListError";
import FeedbackSnackbar from "./FeedbackSnackbar";

const NpcsTabMain = ({ campaignId }) => {
  const navigate = useNavigate();
  const [isLinkNpcDialogOpen, setIsLinkNpcDialogOpen] = useState(false);
  const [linkNpcSearchText, setLinkNpcSearchText] = useState("");
  const [filterSearchText, setFilterSearchText] = useState("");
  const [allNpcs, setAllNpcs] = useState([]);
  const [associatedNpcIds, setAssociatedNpcIds] = useState([]);
  const [campaignNpcs, setCampaignNpcs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [npcSortOrder, setNpcSortOrder] = useState("name");
  const [npcSortDirection, setNpcSortDirection] = useState("asc");
  const [npcFilterType, setNpcFilterType] = useState("all");
  const [npcRank, setNpcRank] = useState("");
  const [npcSpecies, setNpcSpecies] = useState("");
  const [npcTag, setNpcTag] = useState("");
  const [npcFolders, setNpcFolders] = useState([]); // State for NPC folders
  const [selectedNpcFolderId, setSelectedNpcFolderId] = useState(null); // State for selected folder
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [expandedNpcId, setExpandedNpcId] = useState(null);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false); // State for new folder dialog
  const [newNpcFolderName, setNewNpcFolderName] = useState(""); // State for new folder name
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] =
    useState(false);
  const [folderToDeleteConfirmation, setFolderToDeleteConfirmation] =
    useState(null);

  // State for Rename Folder Dialog
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renamedFolderName, setRenamedFolderName] = useState("");

  const loadNpcs = useCallback(async () => {
    setIsLoading(true);
    try {
      const relatedNpcs = await getRelatedNpcs(campaignId);
      setAssociatedNpcIds(relatedNpcs.map((npc) => npc.id));
      setCampaignNpcs(relatedNpcs);

      const allNpcsList = await getNpcs();
      setAllNpcs(allNpcsList);

      // Load folders for the campaign
      try {
        const foldersList = await getNpcFoldersForCampaign(campaignId);
        setNpcFolders(foldersList);
      } catch (folderErr) {
        console.error("Error loading NPC folders:", folderErr);
        setLoadError("Failed to load NPC folders. Please try again.");
      }
    } catch (err) {
      console.error("Error loading NPCs:", err);
      setLoadError("Failed to load NPCs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadNpcs();
  }, [campaignId, loadNpcs]);

  const handleAddExistingNpc = () => setIsLinkNpcDialogOpen(true);
  const handleClose = () => {
    setIsLinkNpcDialogOpen(false);
    setLinkNpcSearchText("");
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
    setNpcFilterType(newValue);
  };

  const handleRankChange = (event) => {
    setNpcRank(event.target.value);
  };

  const handleSpeciesChange = (event) => {
    setNpcSpecies(event.target.value);
  };

  const handleTagChange = (event, newValue) => {
    setNpcTag(newValue);
  };

  const handleSortChange = (order, direction) => {
    setNpcSortOrder(order);
    setNpcSortDirection(direction);
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

  // Filter NPCs for the "Link NPC" dialog based on search text
  const filteredNpcsForDialog = allNpcs.filter((npc) =>
    npc.name.toLowerCase().includes(linkNpcSearchText.toLowerCase())
  );

  // Apply search filter to campaign NPCs
  const searchedCampaignNpcs = campaignNpcs.filter((npc) =>
    npc.name.toLowerCase().includes(filterSearchText.toLowerCase())
  );

  // Apply sorting to the searched campaign NPCs
  const sortedCampaignNpcs = sortNpcs(searchedCampaignNpcs, npcSortOrder, npcSortDirection);

  // Apply folder, attitude/villain filters to the sorted campaign NPCs
  const displayedNpcs = filterNpcs(
    sortedCampaignNpcs,
    selectedNpcFolderId,
    npcFilterType,
    filterSearchText,
    npcTag,
    npcRank,
    npcSpecies
  );

  const handleCreateFolder = async () => {
    try {
      await addNpcFolder({
        campaignId: campaignId,
        name: newNpcFolderName,
        parentId: selectedNpcFolderId || null, // Use selected folder as parent
      });
      // Refresh folders list
      const foldersList = await getNpcFoldersForCampaign(campaignId);
      setNpcFolders(foldersList);
      setIsNewFolderDialogOpen(false);
      setNewNpcFolderName("");
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
      await loadNpcs(); // Reload NPCs to reflect the change
    } catch (error) {
      console.error("Error moving NPC to folder:", error);
      showSnackbar("Failed to move NPC to folder", "error");
    }
  };

  const handleRenameFolder = (folderId) => {
    const folder = npcFolders.find((f) => f.id === folderId);
    if (folder) {
      setFolderToRename(folder);
      setRenamedFolderName(folder.name);
      setIsRenameFolderDialogOpen(true);
    } else {
      console.error("Folder not found for renaming:", folderId);
      showSnackbar("Could not find the folder to rename.", "error");
    }
  };

  const handleDeleteFolder = (folderId) => {
    // This will use the existing delete folder functionality
    // Just need to trigger the delete dialog
    const folderToDelete = npcFolders.find((f) => f.id === folderId);
    if (folderToDelete) {
      setFolderToDeleteConfirmation(folderToDelete);
      setIsDeleteFolderDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!folderToDeleteConfirmation) return;

    const folderIdToDelete = folderToDeleteConfirmation.id;
    const originalFolders = [...npcFolders]; // Create a copy for reverting

    // Optimistic update: Remove the folder from the UI immediately
    setNpcFolders(npcFolders.filter((f) => f.id !== folderIdToDelete));

    try {
      await deleteNpcFolder(folderIdToDelete, campaignId);

      // If the deleted folder was selected, reset to "All NPCs" view
      if (selectedNpcFolderId === folderIdToDelete) {
        setSelectedNpcFolderId(null);
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
      alert(`Failed to delete folder: ${error.message}`);
      // Revert the optimistic update
      setNpcFolders(originalFolders);
    } finally {
      setIsDeleteFolderDialogOpen(false);
      setFolderToDeleteConfirmation(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteFolderDialogOpen(false);
    setFolderToDeleteConfirmation(null);
  };

  // Function to handle the actual folder renaming
  const handleConfirmRenameFolder = async () => {
    if (!folderToRename || !renamedFolderName.trim()) return;

    try {
      await updateNpcFolder({
        id: folderToRename.id,
        campaignId: folderToRename.campaignId,
        name: renamedFolderName.trim(),
        parentId: folderToRename.parentId,
      });
      showSnackbar("Folder renamed successfully", "success");
      // Refresh folders list
      const foldersList = await getNpcFoldersForCampaign(campaignId);
      setNpcFolders(foldersList);
      setIsRenameFolderDialogOpen(false);
      setFolderToRename(null);
      setRenamedFolderName("");
    } catch (error) {
      console.error("Error renaming folder:", error);
      showSnackbar("Failed to rename folder", "error");
      // Optionally keep the dialog open on error:
      // setIsRenameFolderDialogOpen(true);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <NpcsTabHeader
            handleAddExistingNpc={handleAddExistingNpc}
            setIsNewFolderDialogOpen={() => setIsNewFolderDialogOpen(true)}
          />
        </Grid>

        {/* Search, sort, and filter controls */}
        {campaignNpcs.length > 0 && (
          <Grid item xs={12}>
            <SearchbarFilter
             searchText={filterSearchText}
             setSearchText={setFilterSearchText}
             sortOrder={npcSortOrder}
             handleSortChange={handleSortChange}
             filterType={npcFilterType}
             handleFilterChange={handleFilterChange}
             npcRank={npcRank}
             handleRankChange={handleRankChange}
             npcSpecies={npcSpecies}
             handleSpeciesChange={handleSpeciesChange}
             sortDirection={npcSortDirection}
             npcTag={npcTag}
             handleTagChange={handleTagChange}
            />
          </Grid>
        )}

        {/* Display NPC Folders */}
        <Grid item xs={12}>
          <FolderExplorer
            folders={npcFolders}
            selectedFolderId={selectedNpcFolderId}
            setSelectedFolderId={setSelectedNpcFolderId}
            setFolders={setNpcFolders}
          />
        </Grid>

        {/* Loading state */}
        {isLoading && (
          <Grid item xs={12}>
            <NpcListLoading />
          </Grid>
        )}

        {/* Error state */}
        {loadError && (
          <Grid item xs={12}>
            <NpcListError loadError={loadError} loadNpcs={loadNpcs} />
          </Grid>
        )}

        {/* Empty state */}
        {!isLoading && !loadError && campaignNpcs.length === 0 && (
          <Grid item xs={12}>
            <EmptyNpcsList handleAddExistingNpc={handleAddExistingNpc} />
          </Grid>
        )}

        {/* Display NPCs or Empty State for the current filter */}
        {!isLoading && !loadError && campaignNpcs.length > 0 && (
          <NpcList
            displayedNpcs={displayedNpcs}
            expandedNpcId={expandedNpcId}
            handleExpandNpc={handleExpandNpc}
            handleEditNpc={handleEditNpc}
            handleToggleNpc={handleToggleNpc}
            handleSetAttitude={handleSetAttitude}
            filterType={npcFilterType}
            folders={npcFolders}
            handleMoveNpcToFolder={handleMoveNpcToFolder}
            selectedFolderId={selectedNpcFolderId}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        )}

        {/* Link NPC Dialog */}
        <LinkNpcDialog
          open={isLinkNpcDialogOpen}
          handleClose={handleClose}
          searchText={linkNpcSearchText}
          setSearchText={setLinkNpcSearchText}
          filteredNpcs={filteredNpcsForDialog}
          associatedNpcIds={associatedNpcIds}
          handleToggleNpc={handleToggleNpc}
        />

        {/* Create New Folder Dialog */}
        <FolderNameDialogComponent
          open={isNewFolderDialogOpen}
          handleClose={() => setIsNewFolderDialogOpen(false)}
          handleAction={handleCreateFolder}
          parentId={selectedNpcFolderId}
          mode="create"
          maxLength={50}
          folderName={newNpcFolderName}
          setFolderName={setNewNpcFolderName}
        />

        {/* Rename Folder Dialog */}
        <FolderNameDialogComponent
          open={isRenameFolderDialogOpen}
          handleClose={() => {
            setIsRenameFolderDialogOpen(false);
            setFolderToRename(null);
            setRenamedFolderName("");
          }}
          handleAction={handleConfirmRenameFolder}
          mode="rename"
          maxLength={50}
          folderName={renamedFolderName}
          setFolderName={setRenamedFolderName}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteFolderDialogComponent
          open={isDeleteFolderDialogOpen}
          handleClose={handleCancelDelete}
          folderToDelete={folderToDeleteConfirmation}
          handleConfirmDelete={handleConfirmDelete}
        />

        {/* Feedback snackbar */}
        <FeedbackSnackbar
          snackbar={snackbar}
          handleSnackbarClose={handleSnackbarClose}
        />
      </Grid>
    </Paper>
  );
};

export default NpcsTabMain;
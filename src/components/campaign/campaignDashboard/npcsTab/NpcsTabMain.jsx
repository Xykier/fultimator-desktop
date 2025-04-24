import React, { useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import NpcsTabHeader from "./NpcsTabHeader";
import SearchbarFilter from "./SearchbarFilter";
import FolderNameDialogComponent from "./FolderNameDialogComponent";
import DeleteFolderDialogComponent from "./DeleteFolderDialogComponent";
import LinkNpcDialog from "./LinkNpcDialog";
import EmptyNpcsList from "./EmptyNpcsList";
import NpcListLoading from "./NpcListLoading";
import NpcListError from "./NpcListError";
import FeedbackSnackbar from "./FeedbackSnackbar";
import useCampaignNpcs from "./hooks/useCampaignNpcs";
import { useNpcStore } from "./stores/npcDataStore";
import { useNpcFiltersStore } from "./stores/npcFiltersStore";
import { useNpcFoldersStore } from "./stores/npcFolderStore";
import NpcExplorer from "./NpcExplorer";

const NpcsTabMain = ({ campaignId }) => {
  const {
    // State & Derived Values
    expandedNpcId,
    isLinkNpcDialogOpen,
    linkNpcSearchText,
    filteredNpcsForDialog, // For the link dialog

    // Handlers & Setters
    handleAddExistingNpc,
    handleCloseLinkDialog: handleClose, // Rename for clarity
    handleEditNpc,
    handleExpandNpc,
    handleSetAttitude,
    setLinkNpcSearchText,
  } = useCampaignNpcs(campaignId);

  // Get state from the store
  const { selectedNpcFolderId } = useNpcFiltersStore();

  const {
    initialize: initializeNpcs,
    campaignNpcs,
    isLoading,
    loadError,
    snackbar,
    showSnackbar,
    handleSnackbarClose,
    associatedNpcIds,
    toggleNpc: handleToggleNpc,
  } = useNpcStore();

  const {
    setCampaignId: setFoldersCampaignId,
    fetchFolders,
    newNpcFolderName,
    setNewNpcFolderName,
    isNewFolderDialogOpen,
    setIsNewFolderDialogOpen,
    createFolder,
    isRenameFolderDialogOpen,
    setIsRenameFolderDialogOpen,
    setFolderToRename,
    renamedFolderName,
    setRenamedFolderName,
    confirmRenameFolder,
    isDeleteFolderDialogOpen,
    confirmDeleteFolder,
    cancelDeleteFolder,
    folderToDeleteConfirmation,
    getFolderName,
    setLoadNpcs,
    setShowSnackbar,
  } = useNpcFoldersStore();

  useEffect(() => {
    initializeNpcs(campaignId);
    setFoldersCampaignId(campaignId);
    setLoadNpcs(() => initializeNpcs(campaignId));
    setShowSnackbar(showSnackbar);
    fetchFolders();
  }, [
    campaignId,
    setFoldersCampaignId,
    fetchFolders,
    setLoadNpcs,
    showSnackbar,
    setShowSnackbar,
    initializeNpcs,
  ]);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Grid container spacing={1}>
        {/* Header */}
        <Grid item xs={12}>
          <NpcsTabHeader handleAddExistingNpc={handleAddExistingNpc} />
        </Grid>

        {/* Search, sort, and filter controls */}
        {campaignNpcs.length > 0 && (
          <Grid item xs={12}>
            <SearchbarFilter />
          </Grid>
        )}

        {/* Loading state */}
        {isLoading && (
          <Grid item xs={12}>
            <NpcListLoading />
          </Grid>
        )}

        {/* Error state */}
        {loadError && (
          <Grid item xs={12}>
            <NpcListError />
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
          <Grid item xs={12}>
            <NpcExplorer
              campaignNpcs={campaignNpcs}
              expandedNpcId={expandedNpcId}
              handleExpandNpc={handleExpandNpc}
              handleEditNpc={handleEditNpc}
              handleToggleNpc={handleToggleNpc}
              handleSetAttitude={handleSetAttitude}
            />
          </Grid>
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
          handleAction={() => createFolder(selectedNpcFolderId)}
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
          handleAction={() => confirmRenameFolder()}
          mode="rename"
          maxLength={50}
          folderName={renamedFolderName}
          setFolderName={setRenamedFolderName}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteFolderDialogComponent
          open={isDeleteFolderDialogOpen}
          handleClose={cancelDeleteFolder}
          folderToDelete={
            Array.isArray(folderToDeleteConfirmation)
              ? '"' +
                getFolderName(selectedNpcFolderId) +
                '"' +
                " and its children"
              : getFolderName(folderToDeleteConfirmation)
          }
          handleConfirmDelete={() => confirmDeleteFolder()}
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

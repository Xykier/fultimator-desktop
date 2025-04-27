import React, { useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import {useParams} from 'react-router-dom';
import NpcsTabHeader from "./NpcsTabHeader";
import SearchbarFilter from "./SearchbarFilter";
import LinkNpcDialog from "./LinkNpcDialog";
import EmptyNpcsList from "./EmptyNpcsList";
import NpcListLoading from "./NpcListLoading";
import NpcListError from "./NpcListError";
import FeedbackSnackbar from "./FeedbackSnackbar";
import useCampaignNpcs from "./hooks/useCampaignNpcs";
import { useNpcStore } from "./stores/npcDataStore";
import { useNpcFoldersStore } from "./stores/npcFolderStore";
import NpcExplorer from "./NpcExplorer";

const NpcsTabMain = () => {
  const {campaignId} = useParams();

  const {
    // State & Derived Values
    isLinkNpcDialogOpen,
    linkNpcSearchText,
    filteredNpcsForDialog, // For the link dialog

    // Handlers & Setters
    handleAddExistingNpc,
    handleCloseLinkDialog: handleClose, // Rename for clarity
    setLinkNpcSearchText,
  } = useCampaignNpcs(campaignId);

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
          <>
            <NpcExplorer
              campaignNpcs={campaignNpcs}
              handleToggleNpc={handleToggleNpc}
            />
          </>
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

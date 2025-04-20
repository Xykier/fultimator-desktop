import React from "react";
import { Grid, Paper } from "@mui/material";
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
import useCampaignNpcs from "./hooks/useCampaignNpcs";

const NpcsTabMain = ({ campaignId }) => {
  const {
        // State & Derived Values
        isLoading,
        loadError,
        campaignNpcs, // Base list for potential other uses
        displayedNpcs, // Filtered and sorted list for display
        npcFolders,
        selectedNpcFolderId,
        showAllNpcs,
        snackbar,
        expandedNpcId,
        isLinkNpcDialogOpen,
        linkNpcSearchText,
        filteredNpcsForDialog, // For the link dialog
        filterSearchText, // For the main search bar
        npcSortOrder,
        npcSortDirection,
        npcFilterType,
        npcRank,
        npcSpecies,
        isNewFolderDialogOpen,
        newNpcFolderName,
        isDeleteFolderDialogOpen,
        isRenameFolderDialogOpen,
        renamedFolderName,
        associatedNpcIds, // Useful for checking if an NPC is linked
        folderToDeleteConfirmation,
    
        // Handlers & Setters
        loadNpcs,
        handleAddExistingNpc,
        handleCloseLinkDialog: handleClose, // Rename for clarity
        handleToggleNpc,
        handleEditNpc,
        handleExpandNpc,
        handleSnackbarClose,
        handleFilterChange,
        handleRankChange,
        handleSpeciesChange,
        handleSortChange,
        handleSetAttitude,
        setFilterSearchText,
        setSelectedNpcFolderId,
        setShowAllNpcs,
        handleCreateFolder,
        setIsNewFolderDialogOpen,
        setNewNpcFolderName,
        setNpcFolders,
        handleMoveNpcToFolder,
        handleRenameFolder, // Initiates rename dialog
        setIsRenameFolderDialogOpen,
        setRenamedFolderName,
        handleDeleteFolder, // Initiates delete dialog
        handleConfirmDelete,
        handleCancelDelete,
        handleConfirmRenameFolder,
        setLinkNpcSearchText,
        setFolderToRename
        } = useCampaignNpcs(campaignId);

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
            showAllNpcs={showAllNpcs}
            setShowAllNpcs={setShowAllNpcs}
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
          folderToDelete={
            Array.isArray(folderToDeleteConfirmation)
              ? { name: "selected folder and its children" }
              : folderToDeleteConfirmation
          }
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

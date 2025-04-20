import { useMemo } from "react";
import { useNpcData } from "./useNpcData";
import { useNpcFilters } from "./useNpcFilters";
import { useFolders } from "./useFolders";
import { useNpcDialogs } from "./useNpcDialogs";
import { useNpcActions } from "./useNpcActions";

export const useCampaignNpcs = (campaignId) => {
  // Core data and state management
  const {
    allNpcs,
    associatedNpcIds,
    campaignNpcs,
    npcFolders,
    setNpcFolders,
    isLoading,
    loadError,
    loadNpcs,
    handleToggleNpc,
    snackbar,
    showSnackbar,
    handleSnackbarClose
  } = useNpcData(campaignId);

  // Filtering and sorting
  const {
    filterSearchText,
    npcSortOrder,
    npcSortDirection,
    npcFilterType,
    npcRank,
    npcSpecies,
    selectedNpcFolderId,
    showAllNpcs,
    displayedNpcs,
    setFilterSearchText,
    setSelectedNpcFolderId,
    setShowAllNpcs,
    handleFilterChange,
    handleRankChange,
    handleSpeciesChange,
    handleSortChange
  } = useNpcFilters(campaignNpcs);

  // Folder management
  const {
    isNewFolderDialogOpen,
    newNpcFolderName,
    isDeleteFolderDialogOpen,
    folderToDeleteConfirmation,
    isRenameFolderDialogOpen,
    folderToRename,
    renamedFolderName,
    handleCreateFolder,
    handleMoveNpcToFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleConfirmDelete,
    handleCancelDelete,
    handleConfirmRenameFolder,
    setIsNewFolderDialogOpen,
    setNewNpcFolderName,
    setIsDeleteFolderDialogOpen,
    setIsRenameFolderDialogOpen,
    setRenamedFolderName,
    setFolderToRename
  } = useFolders(campaignId, npcFolders, setNpcFolders, loadNpcs, showSnackbar);

  // Dialog state management
  const {
    isLinkNpcDialogOpen,
    linkNpcSearchText,
    expandedNpcId,
    handleAddExistingNpc,
    handleCloseLinkDialog,
    handleExpandNpc,
    setLinkNpcSearchText
  } = useNpcDialogs();

  // NPC action handlers
  const {
    handleEditNpc,
    handleSetAttitude
  } = useNpcActions(campaignId, loadNpcs, showSnackbar);

  // Filtered NPCs for the "Link NPC" dialog
  const filteredNpcsForDialog = useMemo(() => {
    return allNpcs.filter((npc) =>
      npc.name.toLowerCase().includes(linkNpcSearchText.toLowerCase())
    );
  }, [allNpcs, linkNpcSearchText]);

  // Return everything that the original hook returned
  return {
    // Loading and Error States
    isLoading,
    loadError,

    // NPC Lists and Display Data
    campaignNpcs,
    displayedNpcs,
    allNpcs,
    associatedNpcIds,

    // Folder Management State
    npcFolders,
    selectedNpcFolderId,
    showAllNpcs,
    isNewFolderDialogOpen,
    newNpcFolderName,
    isDeleteFolderDialogOpen,
    isRenameFolderDialogOpen,
    renamedFolderName,
    folderToDeleteConfirmation,
    folderToRename,

    // UI State
    snackbar,
    expandedNpcId,
    isLinkNpcDialogOpen,

    // Search and Filter States
    linkNpcSearchText,
    filteredNpcsForDialog,
    filterSearchText,
    npcSortOrder,
    npcSortDirection,
    npcFilterType,
    npcRank,
    npcSpecies,

    // Event Handlers and Methods
    loadNpcs,
    handleAddExistingNpc,
    handleCloseLinkDialog,
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
    handleRenameFolder,
    setIsRenameFolderDialogOpen,
    setRenamedFolderName,
    handleDeleteFolder,
    setIsDeleteFolderDialogOpen,
    handleConfirmDelete,
    handleCancelDelete,
    handleConfirmRenameFolder,
    setLinkNpcSearchText,
    setFolderToRename,
  };
};

export default useCampaignNpcs;
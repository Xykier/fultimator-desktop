import { useMemo } from "react";
import { useNpcData } from "./useNpcData";
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
    allNpcs,
    associatedNpcIds,

    // Folder Management State
    npcFolders,

    // UI State
    snackbar,
    expandedNpcId,
    isLinkNpcDialogOpen,

    // Search and Filter States
    linkNpcSearchText,
    filteredNpcsForDialog,

    // Event Handlers and Methods
    loadNpcs,
    handleAddExistingNpc,
    handleCloseLinkDialog,
    handleToggleNpc,
    handleEditNpc,
    handleExpandNpc,
    handleSnackbarClose,
    handleSetAttitude,
    setNpcFolders,
    setLinkNpcSearchText,
  };
};

export default useCampaignNpcs;
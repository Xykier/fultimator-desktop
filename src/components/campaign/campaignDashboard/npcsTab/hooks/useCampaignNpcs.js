import { useMemo } from "react";
import { useNpcDialogs } from "./useNpcDialogs";
import { useNpcActions } from "./useNpcActions";
import { useNpcStore } from "../stores/npcDataStore";

export const useCampaignNpcs = (campaignId) => {
  const { allNpcs, loadNpcs, showSnackbar } = useNpcStore();

  // Dialog state management
  const {
    isLinkNpcDialogOpen,
    linkNpcSearchText,
    expandedNpcId,
    handleAddExistingNpc,
    handleCloseLinkDialog,
    handleExpandNpc,
    setLinkNpcSearchText,
  } = useNpcDialogs();

  // NPC action handlers
  const { handleEditNpc, handleSetAttitude } = useNpcActions(
    campaignId,
    loadNpcs,
    showSnackbar
  );

  // Filtered NPCs for the "Link NPC" dialog
  const filteredNpcsForDialog = useMemo(() => {
    return allNpcs.filter((npc) =>
      npc.name.toLowerCase().includes(linkNpcSearchText.toLowerCase())
    );
  }, [allNpcs, linkNpcSearchText]);

  // Return everything that the original hook returned
  return {
    // NPC Lists and Display Data
    allNpcs,

    // UI State
    expandedNpcId,
    isLinkNpcDialogOpen,

    // Search and Filter States
    linkNpcSearchText,
    filteredNpcsForDialog,

    // Event Handlers and Methods
    loadNpcs,
    handleAddExistingNpc,
    handleCloseLinkDialog,
    handleEditNpc,
    handleExpandNpc,
    handleSetAttitude,
    setLinkNpcSearchText,
  };
};

export default useCampaignNpcs;

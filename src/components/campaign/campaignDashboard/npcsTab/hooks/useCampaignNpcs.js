import { useMemo } from "react";
import { useNpcActions } from "./useNpcActions";
import { useNpcStore } from "../stores/npcDataStore";
import { useNpcDialogsStore } from "../stores/npcDialogsStore";

export const useCampaignNpcs = (campaignId) => {
  const { allNpcs, loadNpcs, showSnackbar } = useNpcStore();

  // Dialog state management
  const {
    linkNpcSearchText,
  } = useNpcDialogsStore();

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

    // Search and Filter States
    linkNpcSearchText,
    filteredNpcsForDialog,

    // Event Handlers and Methods
    loadNpcs,
    handleEditNpc,
    handleSetAttitude,
  };
};

export default useCampaignNpcs;

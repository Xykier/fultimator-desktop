// src/stores/npcStore.js
import { create } from "zustand";
import {
  getRelatedNpcs,
  getNpcs,
  associateNpcWithCampaign,
  disassociateNpcFromCampaign,
  getNpcFoldersForCampaign,
} from "../../../../../utility/db";

export const useNpcStore = create((set, get) => ({
  // Data
  allNpcs: [],
  associatedNpcIds: [],
  campaignNpcs: [],
  npcFolders: [],
  campaignId: null,

  // Loading state
  isLoading: false,
  loadError: null,

  // Snackbar state
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },

  // Setters
  setCampaignId: (id) => set({ campaignId: id }),
  setAllNpcs: (npcs) => set({ allNpcs: npcs }),
  setAssociatedNpcIds: (ids) => set({ associatedNpcIds: ids }),
  setCampaignNpcs: (npcs) => set({ campaignNpcs: npcs }),
  setNpcFolders: (folders) => set({ npcFolders: folders }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setLoadError: (error) => set({ loadError: error }),

  // Snackbar actions
  showSnackbar: (message, severity) =>
    set({
      snackbar: {
        open: true,
        message,
        severity,
      },
    }),

  handleSnackbarClose: () =>
    set((state) => ({
      snackbar: { ...state.snackbar, open: false },
    })),

  // Core actions
  loadNpcs: async () => {
    const { campaignId } = get();

    set({ isLoading: true, loadError: null });

    try {
      // Load NPCs associated with campaign
      const relatedNpcs = await getRelatedNpcs(campaignId);
      set({
        associatedNpcIds: relatedNpcs.map((npc) => npc.id),
        campaignNpcs: relatedNpcs,
      });

      // Load all NPCs
      const allNpcsList = await getNpcs();
      set({ allNpcs: allNpcsList });

      // Load folders for the campaign
      try {
        const foldersList = await getNpcFoldersForCampaign(campaignId);
        set({ npcFolders: foldersList });
      } catch (folderErr) {
        console.error("Error loading NPC folders:", folderErr);
        set({ loadError: "Failed to load NPC folders. Please try again." });
      }

      return {
        campaignNpcs: relatedNpcs,
        allNpcs: allNpcsList,
        npcFolders: get().npcFolders,
      };
    } catch (err) {
      console.error("Error loading NPCs:", err);
      set({ loadError: "Failed to load NPCs. Please try again." });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleNpc: async (npcId) => {
    const {
      campaignId,
      associatedNpcIds,
      allNpcs,
      campaignNpcs,
      showSnackbar,
    } = get();

    try {
      if (associatedNpcIds.includes(npcId)) {
        // Remove NPC from campaign
        await disassociateNpcFromCampaign(npcId, campaignId);

        set({
          associatedNpcIds: associatedNpcIds.filter((id) => id !== npcId),
          campaignNpcs: campaignNpcs.filter((npc) => npc.id !== npcId),
        });

        showSnackbar("NPC removed from campaign", "info");
        return true;
      } else {
        // Add NPC to campaign
        await associateNpcWithCampaign(npcId, campaignId);

        const npc = allNpcs.find((n) => n.id === npcId);
        if (npc) {
          set({
            associatedNpcIds: [...associatedNpcIds, npcId],
            campaignNpcs: [...campaignNpcs, npc],
          });

          showSnackbar("NPC added to campaign", "success");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error toggling NPC association:", error);
      showSnackbar("Failed to update NPC association", "error");
      return false;
    }
  },

  unlinkMultipleNpcs: async (npcIds = []) => {
    const {
      campaignId,
      associatedNpcIds,
      campaignNpcs,
      showSnackbar,
    } = get();
  
    if (!npcIds.length) return;
  
    try {
      // Use Promise.all to remove all NPCs in parallel
      await Promise.all(
        npcIds.map((npcId) =>
          disassociateNpcFromCampaign(npcId, campaignId)
        )
      );
  
      // Filter out the removed NPCs from state
      const updatedNpcIds = associatedNpcIds.filter(id => !npcIds.includes(id));
      const updatedCampaignNpcs = campaignNpcs.filter(npc => !npcIds.includes(npc.id));
  
      set({
        associatedNpcIds: updatedNpcIds,
        campaignNpcs: updatedCampaignNpcs,
      });
  
      showSnackbar(`${npcIds.length} NPC(s) removed from campaign`, "info");
    } catch (error) {
      console.error("Error unlinking multiple NPCs:", error);
      showSnackbar("Failed to remove NPCs from campaign", "error");
    }
  },

  // Initialize - can be called in useEffect when component mounts
  initialize: async (campaignId) => {
    set({ campaignId });
    return get().loadNpcs();
  },
}));
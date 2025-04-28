import { create } from "zustand";

// Create a Zustand store for NPC dialogs
export const useNpcDialogsStore = create((set) => ({
  // State
  isLinkNpcDialogOpen: false,
  linkNpcSearchText: "",
  expandedNpcId: null,
  isSimpleNpcDialogEditOpen: false,
  selectedNpcId: null,
  simpleNpcItem: null,

  // Actions
  handleAddExistingNpc: () => set({ isLinkNpcDialogOpen: true }),

  handleCloseLinkDialog: () =>
    set({
      isLinkNpcDialogOpen: false,
      linkNpcSearchText: "",
    }),

  handleExpandNpc: (npcId) =>
    set((state) => ({
      expandedNpcId: state.expandedNpcId === npcId ? null : npcId,
    })),

  setLinkNpcSearchText: (text) =>
    set({
      linkNpcSearchText: text,
    }),

  setSimpleNpcItem: (npc) =>
    set({
      simpleNpcItem: npc,
    }),

  handleOpenSimpleNpcDialogEdit: (npc) =>
    set({
      simpleNpcItem: npc,
      isSimpleNpcDialogEditOpen: true,
    }),

  handleCloseSimpleNpcDialogEdit: () =>
    set({
      simpleNpcItem: {},
      isSimpleNpcDialogEditOpen: false,
    }),
}));

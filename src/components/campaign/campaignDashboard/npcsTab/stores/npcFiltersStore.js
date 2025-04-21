import { create } from "zustand";
import { sortNpcs } from "../../../../../utility/npcUtils";

export const useNpcFiltersStore = create((set, get) => ({
  // State
  filterSearchText: "",
  npcSortOrder: "name",
  npcSortDirection: "asc",
  npcAttitudeFilter: "all", // Changed from npcFilterType to be more specific
  showVillainsOnly: false, // New separate state for villains
  npcRank: "",
  npcSpecies: "",
  selectedNpcFolderId: null,
  showAllFolders: false,

  // Actions
  setFilterSearchText: (text) => set({ filterSearchText: text }),
  setNpcSortOrder: (order) => set({ npcSortOrder: order }),
  setNpcSortDirection: (direction) => set({ npcSortDirection: direction }),
  setNpcAttitudeFilter: (attitude) => set({ npcAttitudeFilter: attitude }),
  setShowVillainsOnly: (show) => set({ showVillainsOnly: show }),
  setNpcRank: (rank) => set({ npcRank: rank }),
  setNpcSpecies: (species) => set({ npcSpecies: species }),
  setSelectedNpcFolderId: (id) => set({ selectedNpcFolderId: id }),
  setShowAllFolders: (show) => set({ showAllFolders: show }),

  // Derived filtering logic
  getDisplayedNpcs: (campaignNpcs) => {
    const {
      filterSearchText,
      npcSortOrder,
      npcSortDirection,
      npcAttitudeFilter,
      showVillainsOnly,
      npcRank,
      npcSpecies,
      selectedNpcFolderId,
      showAllFolders,
    } = get();

    const filteredBySearch = campaignNpcs.filter((npc) =>
      npc.name.toLowerCase().includes(filterSearchText.toLowerCase())
    );

    const sorted = sortNpcs(filteredBySearch, npcSortOrder, npcSortDirection);

    const displayed = sorted.filter((npc) => {
      // Folder filter
      if (!showAllFolders && selectedNpcFolderId === null && npc.folderId) {
        return false;
      } else if (!showAllFolders && selectedNpcFolderId !== null) {
        if (npc.folderId !== selectedNpcFolderId) return false;
      }

      // Attitude filter
      if (npcAttitudeFilter !== "all" && npc.attitude !== npcAttitudeFilter)
        return false;

      // Villain filter
      if (showVillainsOnly) {
        const validVillains = ["minor", "major", "superior"];
        if (!validVillains.includes(npc.villain)) return false;
      }

      // Rank & species
      const npcEffectiveRank = npc.rank || "soldier";
      if (npcRank && npcEffectiveRank !== npcRank) return false;
      if (npcSpecies && npc.species !== npcSpecies) return false;

      return true;
    });

    return displayed;
  },
}));

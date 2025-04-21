import { useState, useMemo } from "react";
import { sortNpcs } from "../../../../../utility/npcUtils";

export const useNpcFilters = (campaignNpcs) => {
  const [filterSearchText, setFilterSearchText] = useState("");
  const [npcSortOrder, setNpcSortOrder] = useState("name");
  const [npcSortDirection, setNpcSortDirection] = useState("asc");
  const [npcFilterType, setNpcFilterType] = useState("all");
  const [npcRank, setNpcRank] = useState("");
  const [npcSpecies, setNpcSpecies] = useState("");
  const [selectedNpcFolderId, setSelectedNpcFolderId] = useState(null);
  const [showAllFolders, setShowAllFolders] = useState(false);

  const handleFilterChange = (event, newValue) => {
    setNpcFilterType(newValue);
  };

  const handleRankChange = (event) => {
    if (typeof event === "string" || event === null) {
      setNpcRank(event);
    } else {
      setNpcRank(event.target.value);
    }
  };

  const handleSpeciesChange = (event) => {
    if (typeof event === "string" || event === null) {
      setNpcSpecies(event);
    } else {
      setNpcSpecies(event.target.value);
    }
  };

  const handleSortChange = (order, direction) => {
    setNpcSortOrder(order);
    setNpcSortDirection(direction);
  };

  // Apply search filter to campaign NPCs
  const searchedCampaignNpcs = useMemo(() => {
    return campaignNpcs.filter((npc) =>
      npc.name.toLowerCase().includes(filterSearchText.toLowerCase())
    );
  }, [campaignNpcs, filterSearchText]);

  // Apply sorting to the searched campaign NPCs
  const sortedCampaignNpcs = useMemo(() => {
    return sortNpcs(searchedCampaignNpcs, npcSortOrder, npcSortDirection);
  }, [searchedCampaignNpcs, npcSortOrder, npcSortDirection]);

  // Apply folder filters to the sorted campaign NPCs
  const displayedNpcs = useMemo(() => {
    if (!campaignNpcs.length) return [];

    return sortedCampaignNpcs.filter((npc) => {
      // Filter by folder
      if (!showAllFolders && selectedNpcFolderId === null) {
        // Show NPCs not in any folder if no specific folder is selected and not showing all folders
        if (npc.folderId) {
          return false;
        }
      } else if (!showAllFolders && selectedNpcFolderId !== null) {
        // Show NPCs in the selected folder when not showing all folders
        if (npc.folderId !== selectedNpcFolderId) {
          return false;
        }
      }
      // When showAllNpcs is true, we don't apply any folder filtering

      // Apply other filters regardless of folder selection
      if (npcFilterType === "villains") {
        if (!npc.villain) {
          return false;
        }
      } else if (npcFilterType !== "all") {
        if (npc.attitude !== npcFilterType) {
          return false;
        }
      }

      if (npcRank && npc.rank !== npcRank) {
        return false;
      }

      if (npcSpecies && npc.species !== npcSpecies) {
        return false;
      }

      return true;
    });
  }, [
    sortedCampaignNpcs,
    selectedNpcFolderId,
    showAllFolders,
    campaignNpcs.length,
    npcFilterType,
    npcRank,
    npcSpecies,
  ]);

  return {
    // Filter states
    filterSearchText,
    npcSortOrder,
    npcSortDirection,
    npcFilterType,
    npcRank,
    npcSpecies,
    selectedNpcFolderId,
    showAllFolders,
    // Filter results
    displayedNpcs,
    sortedCampaignNpcs,
    // Actions
    setFilterSearchText,
    setSelectedNpcFolderId,
    setShowAllFolders,
    handleFilterChange,
    handleRankChange,
    handleSpeciesChange,
    handleSortChange,
  };
};

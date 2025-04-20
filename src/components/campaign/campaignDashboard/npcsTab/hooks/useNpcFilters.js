import { useState, useMemo } from "react";
import { sortNpcs } from "../../../../../utility/npcUtils";

export const useNpcFilters = (campaignNpcs) => {
  const [filterSearchText, setFilterSearchText] = useState("");
  const [npcSortOrder, setNpcSortOrder] = useState("name");
  const [npcSortDirection, setNpcSortDirection] = useState("asc");
  const [npcFilterType, setNpcFilterType] = useState("all");
  const [npcRank, setNpcRank] = useState("");
  const [npcSpecies, setNpcSpecies] = useState("");
  const [npcTag, setNpcTag] = useState("");
  const [selectedNpcFolderId, setSelectedNpcFolderId] = useState(null);
  const [showAllNpcs, setShowAllNpcs] = useState(false);

  const handleFilterChange = (event, newValue) => {
    setNpcFilterType(newValue);
  };

  const handleRankChange = (event) => {
    setNpcRank(event.target.value);
  };

  const handleSpeciesChange = (event) => {
    setNpcSpecies(event.target.value);
  };

  const handleTagChange = (event, newValue) => {
    setNpcTag(newValue);
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
    return sortNpcs(
      searchedCampaignNpcs,
      npcSortOrder,
      npcSortDirection
    );
  }, [searchedCampaignNpcs, npcSortOrder, npcSortDirection]);

  // Apply folder filters to the sorted campaign NPCs
  const displayedNpcs = useMemo(() => {
    if (!campaignNpcs.length) return [];

    return sortedCampaignNpcs.filter((npc) => {
      if (showAllNpcs) {
        return true;
      } else if (selectedNpcFolderId === null) {
        // Show NPCs not in any folder if 'All NPCs' is not selected and no specific folder is selected
        return !npc.folderId; // Check if folderId is null or undefined
      } else {
        // Show NPCs in the selected folder
        return npc.folderId === selectedNpcFolderId;
      }
    });
  }, [sortedCampaignNpcs, selectedNpcFolderId, showAllNpcs, campaignNpcs.length]);

  return {
    // Filter states
    filterSearchText,
    npcSortOrder,
    npcSortDirection,
    npcFilterType,
    npcRank,
    npcSpecies,
    npcTag,
    selectedNpcFolderId,
    showAllNpcs,
    // Filter results
    displayedNpcs,
    sortedCampaignNpcs,
    // Actions
    setFilterSearchText,
    setSelectedNpcFolderId,
    setShowAllNpcs,
    handleFilterChange,
    handleRankChange,
    handleSpeciesChange,
    handleTagChange,
    handleSortChange
  };
};
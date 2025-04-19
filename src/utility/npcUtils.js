// src/utility/npcUtils.js

/**
 * Sorts an array of NPCs based on the specified sort order.
 * @param {Array<object>} npcs - The array of NPCs to sort.
 * @param {string} sortOrder - The order in which to sort the NPCs ('name', 'level', 'species').
 * @returns {Array<object>} - The sorted array of NPCs.
 */
export const sortNpcs = (npcs, sortOrder, direction = 'asc') => {
  const sortedNpcs = [...npcs].sort((a, b) => {
    const asc = direction === 'asc' ? 1 : -1;

    if (sortOrder === "name") return asc * a.name.localeCompare(b.name);
    if (sortOrder === "level") return asc * ((a.lvl || 0) - (b.lvl || 0)); // Sort by level (handle undefined lvl)
    if (sortOrder === "species")
      return asc * (a.species || "").localeCompare(b.species || ""); // Sort by species (handle undefined species)
    if (sortOrder === "createdAt") return asc * ((a.createdAt || 0) - (b.createdAt || 0));
    if (sortOrder === "updatedAt") return asc * ((a.updatedAt || 0) - (b.updatedAt || 0));
    return 0;
  });
  return sortedNpcs;
};

/**
 * Filters an array of NPCs based on the specified folder ID and filter type.
 * @param {Array<object>} npcs - The array of NPCs to filter.
 * @param {string|null} selectedNpcFolderId - The ID of the selected NPC folder, or null to show NPCs without a folder.
 * @param {string} filterType - The type of filter to apply ('all', 'friendly', 'hostile', 'neutral', 'villains').
 * @returns {Array<object>} - The filtered array of NPCs.
 */
export const filterNpcs = (npcs, selectedNpcFolderId, filterType, name, tag, rank, species) => {
  const filteredNpcs = npcs.filter((npc) => {
    if (name && !npc.name.toLowerCase().includes(name.toLowerCase())) {
      return false;
    }

    if (tag && !npc.tags?.some((t) => t.name?.toUpperCase() === tag.toUpperCase())) {
      return false;
    }

    if (species && npc.species !== species) {
      return false;
    }

    if (rank && npc.rank !== rank) {
      return false;
    }
  
    // Filter by folder
    if (selectedNpcFolderId) {
      if (selectedNpcFolderId === null && npc.folderId !== null) return false; // Show NPCs without a folder selected
      if (selectedNpcFolderId !== null && npc.folderId !== selectedNpcFolderId)
        return false; // Show NPCs in the selected folder
    }

    // Filter by attitude/villain
    if (filterType === "all") return true;
    if (filterType === "friendly") return npc.attitude === "friendly";
    if (filterType === "hostile") return npc.attitude === "hostile";
    if (filterType === "neutral") return npc.attitude === "neutral";
    if (filterType === "villains") {
      return ["minor", "major", "supreme"].includes(npc.villain); // Show villains (assuming villain is still on the base NPC object)
    }
    return true;
  });
  return filteredNpcs;
};
import {create} from 'zustand';
import {associatePcWithCampaign, getRelatedPcs} from '../../../../../utility/db/relationship.js';

export const usePCStore = create((set, get) => ({
  allPcs: [],
  campaignId: null,
  characterFolders: [],

  // Loading state
  isLoading: false,
  loadError: null,

  // Setters
  setCampaignId: (id) => set({ campaignId: id }),
  setCharacters: (characters) => set({allPcs: characters}),

  // Actions
  loadCharacters: async () => {
    const { campaignId } = get();
    set({ isLoading: true, loadError: null });

    try {
      const relatedPCs = (await getRelatedPcs(campaignId)) || [];
      set({ allPcs: relatedPCs, isLoading: false });

      return {
        allPcs: relatedPCs,
        characterFolders: get().characterFolders
      }
    } catch (err) {
      console.error("Error loading characters:", err);
      set({ loadError: "Failed to load characters. Please try again." });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addCharacter: async (characterId) => {
    const { campaignId } = get();

    try {
      await associatePcWithCampaign(characterId, campaignId);
      return this.loadCharacters();
    } catch (err) {
      console.error('Error adding character:', err);
      throw err;
    }
  }
}));

import {create} from 'zustand';
import {getCampaign, updateCampaign, updateCampaignLastPlayed} from '../../../utility/db/campaign.js';

export const useCampaignStore = create((set, get) => ({
  campaign: {},
  allCampaigns: [],
  campaignId: null,

  // Loading state
  isLoading: false,
  loadError: null,

  // Setters
  setCampaignId: (id) => set({ campaignId: id }),

  // Actions
  loadCampaign: async () => {
    const { campaignId } = get();
    set({ isLoading: true, loadError: null });

    try {
      const campaign = await getCampaign(campaignId);
      set({ campaign, isLoading: false });

      return { campaign };
    } catch (err) {
      console.error("Error loading campaign:", err);
      set({ loadError: "Failed to load campaign. Please try again." });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCampaign: async (campaign) => {
    try {
      const campaignToUpdate = { ...campaign };
      // Set default image if no image URL is provided
      if (!campaignToUpdate.imageUrl) {
        campaignToUpdate.imageUrl = '/images/default-campaign.jpg';
      }
      await updateCampaign(campaignToUpdate);
      set({ campaign: campaignToUpdate });
      return campaignToUpdate;
    } catch (err) {
      console.error("Error updating campaign:", err);
    }
  },

  updateLastPlayed: async () => {
    await updateCampaignLastPlayed(get().campaignId);
  }
}));

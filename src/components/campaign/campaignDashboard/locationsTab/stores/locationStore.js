import {create} from 'zustand';
import {getLocationHierarchy, addLocation as dbAddLocation} from '../../../../../utility/db/location.js';

export const useLocationStore = create((set, get) => ({
  locations: [],
  campaignId: null,
  locationFolders: [],

  // Loading state
  isLoading: false,
  loadError: null,

  // Setters
  setCampaignId: (id) => set({ campaignId: id }),
  setLocations: (locations) => set({locations: locations}),

  // Actions
  loadLocations: async () => {
    const { campaignId } = get();
    set({ isLoading: true, loadError: null });

    try {
      const locations = await getLocationHierarchy(campaignId);
      set({ locations: locations, isLoading: false });

      return {
        locations: locations,
        locationFolders: get().locationFolders
      }
    } catch (err) {
      console.error("Error loading NPCs:", err);
      set({ loadError: "Failed to load NPCs. Please try again." });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addLocation: async (location) => {
    try {
      const newLocationId = await dbAddLocation(location);
      const updatedLocation = {...location, id: newLocationId};
      set(state => ({
        locations: [...state.locations, updatedLocation]
      }));
      return updatedLocation;
    } catch (err) {
      console.error('Error adding location:', err);
      throw err;
    }
  }
}));

import {create} from 'zustand';
import {addNote, getNoteHierarchy} from '../../../../../utility/db/note.js';

export const useNoteStore = create((set, get) => ({
  notes: [],
  campaignId: null,
  noteFolders: [],

  // Loading state
  isLoading: false,
  loadError: null,

  // Setters
  setCampaignId: (id) => set({ campaignId: id }),
  setNotes: (notes) => set({notes: notes}),

  // Actions
  loadNotes: async () => {
    const { campaignId } = get();
    set({ isLoading: true, loadError: null });

    try {
      const notes = await getNoteHierarchy(campaignId);
      set({ notes: notes, isLoading: false });

      return {
        notes: notes,
        noteFolders: get().noteFolders
      }
    } catch (err) {
      console.error("Error loading notes:", err);
      set({ loadError: "Failed to load notes. Please try again." });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addNote: async (note) => {
    try {
      const newNote = await addNote(note);
      set({ notes: [...get().notes, newNote] });
      return newNote;
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  }
}));

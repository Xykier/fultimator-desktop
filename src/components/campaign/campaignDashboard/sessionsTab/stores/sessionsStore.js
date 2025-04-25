import {isAfter, isBefore, parseISO} from 'date-fns';
import {create} from 'zustand';
import {addSession, getSessions} from '../../../../../utility/db/session.js';

export const useSessionStore = create((set, get) => ({
  sessions: [],
  campaignId: null,

  // Loading state
  isLoading: false,
  loadError: null,

  // Setters
  setCampaignId: (id) => set({ campaignId: id }),
  setSessions: (sessions) => set({sessions}),

  // Actions
  loadSessions: async () => {
    const { campaignId } = get();
    set({ isLoading: true, loadError: null });

    try {
      const sessions = await getSessions(campaignId);
      set({ sessions: sessions, isLoading: false });

      return { sessions };
    } catch (err) {
      console.error("Error loading sessions:", err);
      set({ loadError: "Failed to load sessions. Please try again." });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addSession: async (session) => {
    try {
      const newSessionId = await addSession(session);
      const updatedSession = {...session, id: newSessionId};
      set(state => ({
        sessions: [...state.sessions, updatedSession]
      }));
      return updatedSession;
    } catch (err) {
      console.error('Error adding session:', err);
      throw err;
    }
  },

  getUpcomingSession: () => {
    const now = new Date();
    return get().sessions
      .filter(
        (session) =>
          session.plannedDate &&
          session.status !== "completed" &&
          isAfter(parseISO(session.plannedDate), now)
      )
      .sort((a, b) => parseISO(a.plannedDate) - parseISO(b.plannedDate))[0];
  },

  getPastSessions: () => {
    const now = new Date();
    return get().sessions
      .filter(
        (session) =>
          session.status === "completed" ||
          (session.plannedDate && isBefore(parseISO(session.plannedDate), now))
      )
      .sort(
        (a, b) =>
          parseISO(b.plannedDate || b.playedDate) -
          parseISO(a.plannedDate || a.playedDate)
      );
  },
}));

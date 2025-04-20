import { useState, useEffect, useCallback } from "react";
import {
  getRelatedNpcs,
  getNpcs,
  associateNpcWithCampaign,
  disassociateNpcFromCampaign,
  getNpcFoldersForCampaign,
} from "../../../../../utility/db";

export const useNpcData = (campaignId) => {
  const [allNpcs, setAllNpcs] = useState([]);
  const [associatedNpcIds, setAssociatedNpcIds] = useState([]);
  const [campaignNpcs, setCampaignNpcs] = useState([]);
  const [npcFolders, setNpcFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const loadNpcs = useCallback(async () => {
    setIsLoading(true);
    try {
      const relatedNpcs = await getRelatedNpcs(campaignId);
      setAssociatedNpcIds(relatedNpcs.map((npc) => npc.id));
      setCampaignNpcs(relatedNpcs);

      const allNpcsList = await getNpcs();
      setAllNpcs(allNpcsList);

      // Load folders for the campaign
      try {
        const foldersList = await getNpcFoldersForCampaign(campaignId);
        console.log("Folders list:", foldersList);
        setNpcFolders(foldersList);
      } catch (folderErr) {
        console.error("Error loading NPC folders:", folderErr);
        setLoadError("Failed to load NPC folders. Please try again.");
      }
    } catch (err) {
      console.error("Error loading NPCs:", err);
      setLoadError("Failed to load NPCs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadNpcs();
  }, [campaignId, loadNpcs]);

  const handleToggleNpc = async (npcId) => {
    try {
      if (associatedNpcIds.includes(npcId)) {
        await disassociateNpcFromCampaign(npcId, campaignId);
        setAssociatedNpcIds((prev) => prev.filter((id) => id !== npcId));
        setCampaignNpcs((prev) => prev.filter((npc) => npc.id !== npcId));
        showSnackbar("NPC removed from campaign", "info");
      } else {
        await associateNpcWithCampaign(npcId, campaignId);
        setAssociatedNpcIds((prev) => [...prev, npcId]);
        const npc = allNpcs.find((n) => n.id === npcId);
        if (npc) {
          setCampaignNpcs((prev) => [...prev, npc]);
          showSnackbar("NPC added to campaign", "success");
        }
      }
    } catch (error) {
      console.error("Error toggling NPC association:", error);
      showSnackbar("Failed to update NPC association", "error");
    }
  };

  return {
    // Data
    allNpcs,
    associatedNpcIds,
    campaignNpcs,
    npcFolders,
    setNpcFolders,
    // Loading state
    isLoading,
    loadError,
    // Actions
    loadNpcs,
    handleToggleNpc,
    // Snackbar
    snackbar,
    showSnackbar,
    handleSnackbarClose,
    // Setters
    setCampaignNpcs
  };
};
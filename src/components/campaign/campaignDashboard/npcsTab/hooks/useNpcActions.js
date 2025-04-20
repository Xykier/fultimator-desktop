import { useNavigate } from "react-router-dom";
import { updateNpcCampaignAttitude } from "../../../../../utility/db";

export const useNpcActions = (campaignId, loadNpcs, showSnackbar) => {
  const navigate = useNavigate();

  const handleEditNpc = (npcId) => {
    navigate(`/npc-gallery/${npcId}`);
  };

  const handleSetAttitude = async (npcId, newAttitude) => {
    try {
      await updateNpcCampaignAttitude(npcId, campaignId, newAttitude);
      showSnackbar(`NPC attitude set to ${newAttitude}`, "success");
      await loadNpcs(); // Reload NPCs to reflect the change
    } catch (err) {
      console.error("Error updating NPC attitude:", err);
      showSnackbar("Failed to update NPC attitude", "error");
    }
  };

  return {
    handleEditNpc,
    handleSetAttitude
  };
};
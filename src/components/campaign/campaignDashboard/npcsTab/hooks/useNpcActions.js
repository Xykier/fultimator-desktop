import { useNavigate } from "react-router-dom";
import { updateNpcCampaignAttitude } from "../../../../../utility/db";
import { useTranslate, replacePlaceholders } from "../../../../../translation/translate";

export const useNpcActions = (campaignId, loadNpcs, showSnackbar) => {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const handleEditNpc = (npcId) => {
    navigate(`/npc-gallery/${npcId}`);
  };

  const handleSetAttitude = async (npcId, newAttitude) => {
    try {
      await updateNpcCampaignAttitude(npcId, campaignId, newAttitude);
      showSnackbar(
        replacePlaceholders(t('npc_attitude_update_success'), { 
          attitude: t("npc_attitude_" + newAttitude)
        }), 
        "success"
      );
      await loadNpcs();
    } catch (err) {
      console.error("Error updating NPC attitude:", err);
      showSnackbar(t('npc_attitude_update_error'), "error");
    }
  };

  return {
    handleEditNpc,
    handleSetAttitude
  };
};
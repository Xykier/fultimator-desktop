import { useNavigate } from "react-router-dom";
import { updateNpcCampaignAttitude } from "../../../../../utility/db";
import {
  useTranslate,
  replacePlaceholders,
} from "../../../../../translation/translate";
import { useNpcDialogsStore } from "../stores/npcDialogsStore";

export const useNpcActions = (campaignId, loadNpcs, showSnackbar) => {
  const { t } = useTranslate();
  const { handleOpenSimpleNpcDialogEdit } = useNpcDialogsStore();
  const navigate = useNavigate();

  const handleEditNpc = (npc) => {
    const { id, isSimplified } = npc;
    if (isSimplified) {
      handleOpenSimpleNpcDialogEdit(npc);
    } else {
      navigate(`/npc-gallery/${id}`);
    }
  };

  const handleSetAttitude = async (npcId, newAttitude) => {
    try {
      await updateNpcCampaignAttitude(npcId, campaignId, newAttitude);
      showSnackbar(
        replacePlaceholders(t("npc_attitude_update_success"), {
          attitude: t("npc_attitude_" + newAttitude),
        }),
        "success"
      );
      await loadNpcs();
    } catch (err) {
      console.error("Error updating NPC attitude:", err);
      showSnackbar(t("npc_attitude_update_error"), "error");
    }
  };

  return {
    handleEditNpc,
    handleSetAttitude,
  };
};

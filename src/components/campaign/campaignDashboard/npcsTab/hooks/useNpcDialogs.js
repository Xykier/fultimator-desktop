import { useState } from "react";

export const useNpcDialogs = () => {
  const [isLinkNpcDialogOpen, setIsLinkNpcDialogOpen] = useState(false);
  const [linkNpcSearchText, setLinkNpcSearchText] = useState("");
  const [expandedNpcId, setExpandedNpcId] = useState(null);

  const handleAddExistingNpc = () => setIsLinkNpcDialogOpen(true);
  
  const handleCloseLinkDialog = () => {
    setIsLinkNpcDialogOpen(false);
    setLinkNpcSearchText("");
  };

  const handleExpandNpc = (npcId) => {
    setExpandedNpcId(expandedNpcId === npcId ? null : npcId);
  };

  return {
    // Dialog states
    isLinkNpcDialogOpen,
    linkNpcSearchText,
    expandedNpcId,
    // Actions
    handleAddExistingNpc,
    handleCloseLinkDialog,
    handleExpandNpc,
    setLinkNpcSearchText
  };
};
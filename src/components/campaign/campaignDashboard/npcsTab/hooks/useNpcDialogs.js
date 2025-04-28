import { useState } from "react";

export const useNpcDialogs = () => {
  const [isLinkNpcDialogOpen, setIsLinkNpcDialogOpen] = useState(false);
  const [linkNpcSearchText, setLinkNpcSearchText] = useState("");
  const [expandedNpcId, setExpandedNpcId] = useState(null);
  const [isSimpleNpcDialogEditOpen, setIsSimpleNpcDialogEditOpen] = useState(false);
  const [selectedNpcId, setSelectedNpcId] = useState(null);

  const handleOpenSimpleNpcDialogEdit = (npcId) => {
    setSelectedNpcId(npcId);
    setIsSimpleNpcDialogEditOpen(true);
  };

  const handleCloseSimpleNpcDialogEdit = () => {
    setSelectedNpcId(null);
    setIsSimpleNpcDialogEditOpen(false);
  };

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
    isSimpleNpcDialogEditOpen,
    selectedNpcId,
    // Actions
    handleAddExistingNpc,
    handleCloseLinkDialog,
    handleExpandNpc,
    setLinkNpcSearchText,
    handleOpenSimpleNpcDialogEdit,
    handleCloseSimpleNpcDialogEdit,
  };
};
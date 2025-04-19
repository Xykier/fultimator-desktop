import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import NpcPretty from "../../../npc/Pretty";

const NpcDetailDialog = ({ open, onClose, npc }) => {
  // NPC Details Dialog
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>{npc.name} Details</DialogTitle>
      <DialogContent sx={{ p: 1 }}>
        <NpcPretty npc={npc} collapse={true} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NpcDetailDialog;

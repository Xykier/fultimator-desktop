import React from "react";
import { TextField } from "@mui/material";
import { t } from "../../translation/translate";

const NotesTab = ({ selectedNPC, selectedNPCs, setSelectedNPCs }) => {
  return (
    <TextField
      label={t("Notes")}
      variant="outlined"
      fullWidth
      multiline
      rows={10}
      inputProps={{ maxLength: 2000 }}
      value={
        selectedNPCs.find((npc) => npc.combatId === selectedNPC.combatId)
          ?.combatStats?.notes || ""
      }
      onChange={(e) => {
        const updatedNPCs = selectedNPCs.map((npc) => {
          if (npc.combatId === selectedNPC.combatId) {
            return {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                notes: e.target.value,
              },
            };
          }
          return npc;
        });

        setSelectedNPCs(updatedNPCs);
      }}
      sx={{ mt: 2 }}
    />
  );
};

export default NotesTab;

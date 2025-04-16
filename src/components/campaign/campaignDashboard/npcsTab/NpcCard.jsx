import React from "react";
import { Card, Grid } from "@mui/material";
import NpcPretty from "../../../npc/Pretty";

const NpcCard = ({
  npc,
  expandedNpcId,
  handleExpandNpc,
  handleContextMenu,
}) => {
  return (
    <React.Fragment>
      <Grid item xs={4}>
        <Card
          elevation={2}
          sx={{
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: 4,
            },
            position: "relative",
          }}
          onContextMenu={(e) => handleContextMenu(e, npc)}
        >
          <NpcPretty
            npc={npc}
            collapse={expandedNpcId === npc.id}
            onClick={() => handleExpandNpc(npc.id)}
          />
        </Card>
      </Grid>

      <Grid item xs={8}>
        <div>
          Section with action buttons for that npc (edit, unlink, notes, set if
          friendly, hostile or neutral etc.)
        </div>
      </Grid>
    </React.Fragment>
  );
};

export default NpcCard;

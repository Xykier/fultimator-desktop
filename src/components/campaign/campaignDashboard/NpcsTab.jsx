import React from "react";
import { Grid } from "@mui/material";
import NpcsTabMain from "./npcsTab/NpcsTabMain";

const NpcsTab = ({ campaignId }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <NpcsTabMain campaignId={campaignId} />
      </Grid>
    </Grid>
  );
};

export default NpcsTab;

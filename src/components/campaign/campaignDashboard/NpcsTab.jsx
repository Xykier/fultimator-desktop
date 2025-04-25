import React from "react";
import { Grid } from "@mui/material";
import NpcsTabMain from "./npcsTab/NpcsTabMain";

const NpcsTab = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <NpcsTabMain />
      </Grid>
    </Grid>
  );
};

export default NpcsTab;

import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";

const MapTab = ({ mapUrl }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Campaign Map
      </Typography>

      {mapUrl ? (
        <Card>
          <CardContent>
            <Box
              component="img"
              src={mapUrl}
              alt="Campaign Map"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 1,
                boxShadow: 1,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ py: 5, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No map has been uploaded for this campaign yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapTab;
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const LocationsTab = ({ locations, campaignId }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">Campaign Locations</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/campaign/${campaignId}/location/new`)}
          >
            Add Location
          </Button>
        </Box>
      </Grid>

      <Grid item xs={12}>
        {locations.length > 0 ? (
          <Card>
            <CardContent>
              <List>
                {locations.map((location, index) => (
                  <React.Fragment key={location.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemButton
                        onClick={() =>
                          navigate(`/campaign/${campaignId}/location/${location.id}`)
                        }
                      >
                        <ListItemText
                          primary={location.name}
                          secondary={
                            location.description?.substring(0, 100) +
                            (location.description?.length > 100 ? "..." : "")
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No locations added to this campaign yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/campaign/${campaignId}/location/new`)}
            >
              Add Location
            </Button>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default LocationsTab;
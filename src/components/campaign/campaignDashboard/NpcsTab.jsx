import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const NpcsTab = ({ npcs, campaignId }) => {
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
          <Typography variant="h5">Campaign NPCs</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/campaign/${campaignId}/npc/new`)}
          >
            Add NPC
          </Button>
        </Box>
      </Grid>

      {npcs.length > 0 ? (
        npcs.map((npc) => (
          <Grid item xs={12} sm={6} md={4} key={npc.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", mb: 2 }}>
                  <Avatar
                    src={npc.imageUrl}
                    alt={npc.name}
                    sx={{
                      width: 50,
                      height: 50,
                      mr: 2,
                      bgcolor: npc.isEnemy ? "error.main" : "info.main",
                    }}
                  >
                    {npc.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="h6" sx={{ flex: 1 }} noWrap>
                        {npc.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={npc.isEnemy ? "Enemy" : "NPC"}
                        color={npc.isEnemy ? "error" : "info"}
                      />
                    </Box>                    
                  </Box>
                </Box>

                {npc.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {npc.description.length > 100
                      ? npc.description.substring(0, 100) + "..."
                      : npc.description}
                  </Typography>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    size="small"
                    onClick={() => navigate(`/campaign/${campaignId}/npc/${npc.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No NPCs added to this campaign yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/campaign/${campaignId}/npc/new`)}
            >
              Add NPC
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default NpcsTab;
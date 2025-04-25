import React from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import {usePCStore} from './charactersTab/stores/characterStore.js';

const CharactersTab = () => {
  const navigate = useNavigate();
  const {campaignId} = useParams();
  const {allPcs: pcs} = usePCStore();

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
          <Typography variant="h5">Campaign Characters</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/campaign/${campaignId}/character/add`)}
          >
            Add Character
          </Button>
        </Box>
      </Grid>

      {pcs.length > 0 ? (
        pcs.map((pc) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pc.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", mb: 2 }}>
                  <Avatar
                    src={pc.imageUrl}
                    alt={pc.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  >
                    {pc.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" noWrap>
                      {pc.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pc.job || "No job specified"}
                    </Typography>
                    {pc.concept && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {pc.concept}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      HP
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {pc.currentHP || "-"}/{pc.maxHP || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      MP
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {pc.currentMP || "-"}/{pc.maxMP || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Level
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {pc.level || "-"}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button size="small" onClick={() => navigate(`/pc/${pc.id}`)}>
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
              No characters added to this campaign yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/campaign/${campaignId}/character/add`)}
            >
              Add Character
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default CharactersTab;

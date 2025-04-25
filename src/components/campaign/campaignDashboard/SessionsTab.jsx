import React from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import {useSessionStore} from './sessionsTab/stores/sessionsStore.js';

const SessionsTab = () => {
  const navigate = useNavigate();
  const {campaignId} = useParams();
  const {sessions} = useSessionStore();

  // Group sessions by status
  const upcomingSessions = sessions
    .filter((session) => session.status !== "completed")
    .sort((a, b) => parseISO(a.plannedDate) - parseISO(b.plannedDate));

  const completedSessions = sessions
    .filter((session) => session.status === "completed")
    .sort((a, b) =>
      parseISO(b.playedDate || b.plannedDate) -
      parseISO(a.playedDate || a.plannedDate)
    );

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
          <Typography variant="h5">Campaign Sessions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/campaign/${campaignId}/session/new`)}
          >
            New Session
          </Button>
        </Box>
      </Grid>

      {/* Upcoming Sessions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upcoming Sessions
            </Typography>

            {upcomingSessions.length > 0 ? (
              <List>
                {upcomingSessions.map((session) => (
                  <ListItem
                    key={session.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() =>
                          navigate(
                            `/campaign/${campaignId}/session/${session.id}/edit`
                          )
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() =>
                        navigate(`/campaign/${campaignId}/session/${session.id}`)
                      }
                    >
                      <ListItemText
                        primary={
                          session.title || `Session ${session.sessionNumber || "#"}`
                        }
                        secondary={
                          <>
                            {session.plannedDate && (
                              <Typography variant="body2">
                                {format(
                                  parseISO(session.plannedDate),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </Typography>
                            )}
                            {session.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {session.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No upcoming sessions
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Past Sessions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Completed Sessions
            </Typography>

            {completedSessions.length > 0 ? (
              <List>
                {completedSessions.map((session) => (
                  <ListItem key={session.id}>
                    <ListItemButton
                      onClick={() =>
                        navigate(`/campaign/${campaignId}/session/${session.id}`)
                      }
                    >
                      <ListItemText
                        primary={
                          session.title || `Session ${session.sessionNumber || "#"}`
                        }
                        secondary={
                          <>
                            {(session.playedDate || session.plannedDate) && (
                              <Typography variant="body2">
                                {format(
                                  parseISO(session.playedDate || session.plannedDate),
                                  "MMMM d, yyyy"
                                )}
                              </Typography>
                            )}
                            {session.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {session.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No completed sessions
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SessionsTab;

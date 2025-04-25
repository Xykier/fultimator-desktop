import React from "react";
import {useNavigate, useParams} from 'react-router-dom';
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
  Chip,
  Divider,
} from "@mui/material";
import { Event as EventIcon, CalendarMonth as CalendarIcon, Note as NoteIcon } from "@mui/icons-material";
import { format, parseISO, isToday } from "date-fns";
import {useCampaignStore} from '../stores/campaignStore.js';
import {usePCStore} from './charactersTab/stores/characterStore.js';
import {useLocationStore} from './locationsTab/stores/locationStore.js';
import {useNoteStore} from './notesTab/stores/noteStore.js';
import {useNpcStore} from './npcsTab/stores/npcDataStore.js';
import {useSessionStore} from './sessionsTab/stores/sessionsStore.js';

const OverviewTab = () => {
  const navigate = useNavigate();
  const {campaignId} = useParams();
  const {locations} = useLocationStore();
  const {allNpcs: npcs} = useNpcStore();
  const {allPcs: pcs} = usePCStore();
  const {notes} = useNoteStore();
  const {campaign} = useCampaignStore();
  const sessionStore = useSessionStore();
  const upcomingSession = sessionStore.getUpcomingSession()
  const pastSessions = sessionStore.getPastSessions()

  const test = true;

  const getSessionStatus = (session) => {
    if (!session) return null;

    if (session.status === "completed") {
      return { label: "Completed", color: "success" };
    }

    if (session.plannedDate) {
      const sessionDate = parseISO(session.plannedDate);
      if (isToday(sessionDate)) {
        return { label: "Today!", color: "warning" };
      }
      return { label: "Upcoming", color: "info" };
    }

    return { label: "Planned", color: "primary" };
  };

  if (test) {
    return <div>Test</div>;
  }

  return (
    <Grid container spacing={3}>
      {/* Left Column */}
      <Grid item xs={12} md={8}>
        {/* Next Session Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                {upcomingSession ? "Next Session" : "No Upcoming Sessions"}
              </Typography>
            </Box>

            {upcomingSession ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h5" sx={{ flex: 1 }}>
                    {upcomingSession.title ||
                      `Session ${upcomingSession.sessionNumber || "#"}`}
                  </Typography>
                  <Chip
                    label={getSessionStatus(upcomingSession)?.label}
                    color={getSessionStatus(upcomingSession)?.color}
                    size="small"
                  />
                </Box>

                {upcomingSession.plannedDate && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {format(
                      parseISO(upcomingSession.plannedDate),
                      "EEEE, MMMM d, yyyy • h:mm a"
                    )}
                  </Typography>
                )}

                {upcomingSession.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {upcomingSession.description}
                  </Typography>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigate(`/campaign/${campaignId}/session/${upcomingSession.id}`)
                    }
                  >
                    View Details
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  You haven't scheduled any sessions yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/campaign/${campaignId}/session/new`)}
                >
                  Schedule Session
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ flex: 1 }}>
                Recent Sessions
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(`/campaign/${campaignId}/sessions`)}
              >
                View All
              </Button>
            </Box>

            {pastSessions.length > 0 ? (
              <List disablePadding>
                {pastSessions.slice(0, 3).map((session, index) => (
                  <React.Fragment key={session.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Chip
                          label={session.status === "completed" ? "Completed" : "Missed"}
                          color={session.status === "completed" ? "success" : "error"}
                          size="small"
                        />
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
                            session.plannedDate &&
                            format(parseISO(session.plannedDate), "MMMM d, yyyy")
                          }
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                No past sessions recorded yet.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Notes Preview Card */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <NoteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ flex: 1 }}>
                Recent Notes
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(`/campaign/${campaignId}/notes`)}
              >
                View All
              </Button>
            </Box>

            {notes.length > 0 ? (
              <List disablePadding>
                {notes
                  .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))
                  .slice(0, 3)
                  .map((note, index) => (
                    <React.Fragment key={note.id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() =>
                            navigate(`/campaign/${campaignId}/note/${note.id}`)
                          }
                        >
                          <ListItemText
                            primary={note.title}
                            secondary={`Last updated: ${format(
                              parseISO(note.modifiedAt),
                              "MMM d, yyyy"
                            )}`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </React.Fragment>
                  ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You haven't created any notes yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/campaign/${campaignId}/note/new`)}
                >
                  Create Note
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={4}>
        {/* Campaign Stats Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Campaign Stats
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="h4">
                    {pastSessions.filter((s) => s.status === "completed").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sessions
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="h4">{pcs.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Characters
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="h4">{npcs.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    NPCs
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="h4">{locations.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Locations
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Created: {format(parseISO(campaign.createdAt), "MMMM d, yyyy")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last played:{" "}
              {campaign.lastPlayedAt
                ? format(parseISO(campaign.lastPlayedAt), "MMMM d, yyyy")
                : "Never"}
            </Typography>
          </CardContent>
        </Card>

        {/* Characters Preview Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Characters
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(`/campaign/${campaignId}/characters`)}
              >
                View All
              </Button>
            </Box>

            {pcs.length > 0 ? (
              <List disablePadding>
                {pcs.slice(0, 4).map((pc, index) => (
                  <React.Fragment key={pc.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => navigate(`/pc/${pc.id}`)}>
                        <ListItemText
                          primary={pc.name}
                          secondary={pc.concept || pc.job}
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 1, textAlign: "center" }}
              >
                No characters added yet.
              </Typography>
            )}

            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                onClick={() => navigate(`/campaign/${campaignId}/character/add`)}
              >
                Add Character
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Locations Preview Card */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Key Locations
              </Typography>
              <Button
                size="small"
                onClick={() => navigate(`/campaign/${campaignId}/locations`)}
              >
                View All
              </Button>
            </Box>

            {locations.length > 0 ? (
              <List disablePadding>
                {locations.slice(0, 3).map((location, index) => (
                  <React.Fragment key={location.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() =>
                          navigate(`/campaign/${campaignId}/location/${location.id}`)
                        }
                      >
                        <ListItemText
                          primary={location.name}
                          secondary={
                            location.description?.substring(0, 40) +
                            (location.description?.length > 40 ? "..." : "")
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 1, textAlign: "center" }}
              >
                No locations added yet.
              </Typography>
            )}

            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                onClick={() => navigate(`/campaign/${campaignId}/location/new`)}
              >
                Add Location
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OverviewTab;

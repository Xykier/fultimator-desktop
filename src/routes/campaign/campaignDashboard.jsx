import React, { useState, useEffect } from "react";
import {useParams, useNavigate, Routes, Route, useLocation} from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  getCampaign,
  getSessions,
  getLocationHierarchy,
  getNoteHierarchy,
  getRelatedPcs,
  getRelatedNpcs,
  updateCampaignLastPlayed,
  updateCampaign, // Add updateCampaign import
} from "../../utility/db";
import Layout from "../../components/Layout";
import LoadingPage from "../../components/common/LoadingPage";
import { parseISO, isAfter, isBefore } from "date-fns";
import OverviewTab from "../../components/campaign/campaignDashboard/OverviewTab";
import SessionsTab from "../../components/campaign/campaignDashboard/SessionsTab";
import CharactersTab from "../../components/campaign/campaignDashboard/CharactersTab";
import NpcsTab from "../../components/campaign/campaignDashboard/NpcsTab";
import NotesTab from "../../components/campaign/campaignDashboard/NotesTab";
import LocationsTab from "../../components/campaign/campaignDashboard/LocationsTab";
import MapTab from "../../components/campaign/campaignDashboard/MapTab";
import TabsNavigation from "../../components/campaign/campaignDashboard/TabsNavigation";
import { WorldIcon } from "../../components/icons";
import { ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";
import { ArrowDropUp as ArrowDropUpIcon } from "@mui/icons-material";
import CampaignDialog from "../../components/campaign/campaignList/CampaignDialog"; // Import CampaignDialog

const DEFAULT_CAMPAIGN_IMAGE = "/images/default-campaign.jpg"; // Add default image constant

// Component for the campaign dashboard
const CampaignDashboard = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [campaign, setCampaign] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pcs, setPcs] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  // Add edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Fetch campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setLoading(true);

        // Fetch campaign details
        const campaignData = await getCampaign(parseInt(campaignId));
        if (!campaignData) {
          setError("Campaign not found");
          setLoading(false);
          return;
        }

        setCampaign(campaignData);

        // Update last played timestamp
        await updateCampaignLastPlayed(parseInt(campaignId));

        // Fetch related data
        const [sessionsData, locationsData, notesData, pcsData, npcsData] =
          await Promise.all([
            getSessions(parseInt(campaignId)),
            getLocationHierarchy(parseInt(campaignId)),
            getNoteHierarchy(parseInt(campaignId)),
            getRelatedPcs(parseInt(campaignId)),
            getRelatedNpcs(parseInt(campaignId)),
          ]);

        setSessions(sessionsData || []);
        setLocations(locationsData || []);
        setNotes(notesData || []);
        setPcs(pcsData || []);
        setNpcs(npcsData || []);
      } catch (error) {
        console.error("Error loading campaign data:", error);
        setError("Failed to load campaign data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();
  }, [campaignId]);

  useEffect(() => {
    const tabs = ['overview', 'sessions', 'characters', 'npcs', 'notes', 'locations', 'map'];
    tabs.forEach((tab) => {
      if (location.pathname.includes(tab)) {
        setActiveTab(tab);
      }
    })
  }, [location])

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    navigate(`/campaign/${campaignId}/${newValue}`);
  };

  // Navigate back to campaign list
  const handleBackToCampaigns = () => {
    navigate("/campaigns");
  };

  // Navigate to campaign edit - UPDATE THIS
  const handleEditCampaign = () => {
    // Set the campaign to be edited and open the dialog
    const campaignToEdit = { ...campaign };
    // Clear the imageUrl if it's the default image
    if (campaignToEdit.imageUrl === '/images/default-campaign.jpg') {
      campaignToEdit.imageUrl = '';
    }
    setEditingCampaign(campaignToEdit);
    setEditDialogOpen(true);
  };

  // Add new handlers for the edit dialog
  const handleEditDialogClose = () => {
    if (!actionInProgress) {
      setEditDialogOpen(false);
      setEditingCampaign(null); // Clear the editing campaign data
    }
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditingCampaign((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditImageUpdate = (newImageUrl) => {
    setEditingCampaign((prev) => ({
      ...prev,
      imageUrl: newImageUrl || DEFAULT_CAMPAIGN_IMAGE, // Use default if empty
    }));
  };

  const handleEditTagInput = (event) => {
    const { value } = event.target;
    // Convert comma-separated string to array, trimming whitespace
    const tagsArray = value.split(",").map((tag) => tag.trim()).filter(tag => tag);
    setEditingCampaign((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign || !campaign?.id) return;

    setActionInProgress(true);
    try {
      const campaignToUpdate = { ...editingCampaign };
      // Set default image if no image URL is provided
      if (!campaignToUpdate.imageUrl) {
        campaignToUpdate.imageUrl = '/images/default-campaign.jpg';
      }
      await updateCampaign(campaignToUpdate);
      setCampaign(campaignToUpdate);
      handleEditDialogClose();
    } catch (err) {
      console.error("Error updating campaign:", err);
    } finally {
      setActionInProgress(false);
    }
  };

  // Helper functions
  const getUpcomingSession = () => {
    const now = new Date();
    return sessions
      .filter(
        (session) =>
          session.plannedDate &&
          session.status !== "completed" &&
          isAfter(parseISO(session.plannedDate), now)
      )
      .sort((a, b) => parseISO(a.plannedDate) - parseISO(b.plannedDate))[0];
  };

  const getPastSessions = () => {
    const now = new Date();
    return sessions
      .filter(
        (session) =>
          session.status === "completed" ||
          (session.plannedDate && isBefore(parseISO(session.plannedDate), now))
      )
      .sort(
        (a, b) =>
          parseISO(b.plannedDate || b.playedDate) -
          parseISO(a.plannedDate || a.playedDate)
      );
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !campaign) {
    return (
      <Layout>
        <Container sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || "Campaign not found"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToCampaigns}
            sx={{ borderRadius: 2 }}
          >
            Back to Campaigns
          </Button>
        </Container>
      </Layout>
    );
  }

  const upcomingSession = getUpcomingSession();
  const pastSessions = getPastSessions();

  // Render the dashboard
  return (
    <Layout fullWidth>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
            background: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(to right, ${primary}, ${primary}, ${secondary})`,
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton sx={{ px: 0.5, color: "#ffffff", cursor: "default" }}>
                <WorldIcon color="#ffffff" />
              </IconButton>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: "#ffffff",
                  flex: 1,
                  textTransform: "uppercase",
                  ml: 1,
                }}
              >
                {campaign.name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {campaign.description && (
                <IconButton
                  onClick={() => setShowDescription((prev) => !prev)}
                  sx={{
                    color: "#ffffff",
                    mr: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  title={
                    showDescription ? "Hide description" : "Show description"
                  }
                >
                  {showDescription ? (
                    <ArrowDropUpIcon />
                  ) : (
                    <ArrowDropDownIcon />
                  )}
                </IconButton>
              )}
              <IconButton
                onClick={handleEditCampaign}
                sx={{
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <EditIcon />
              </IconButton>
            </Box>
          </Box>

          {campaign.description && (
            <Box
              sx={{
                maxHeight: showDescription ? "500px" : "0px",
                opacity: showDescription ? 1 : 0,
                overflow: "hidden",
                transition: "max-height 0.35s ease-out, opacity 0.35s ease-out",
                borderTop: showDescription
                  ? `1px solid ${theme.palette.divider}`
                  : "none",
                background: theme.palette.background.paper,
              }}
            >
              <Box
                sx={{
                  p: 3,
                  transform: showDescription
                    ? "translateY(0)"
                    : "translateY(-10px)",
                  transition: "transform 0.35s ease-out",
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {campaign.description}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
        {/* Campaign Dashboard Tabs */}
        <TabsNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Content */}
        <Routes>
          <Route index path="/overview" element={
            <OverviewTab
              campaign={campaign}
              upcomingSession={upcomingSession}
              pastSessions={pastSessions}
              pcs={pcs}
              npcs={npcs}
              notes={notes}
              locations={locations}
              campaignId={campaignId}
            />
          } />
          <Route path="/sessions" element={
            <SessionsTab sessions={sessions} campaignId={campaignId} />
          } />
          <Route path="/characters" element={
            <CharactersTab pcs={pcs} campaignId={campaignId} />
          } />
          <Route path="/npcs" element={
            <NpcsTab npcs={npcs} campaignId={campaignId} />} />
          <Route path="/notes" element={<NotesTab notes={notes} campaignId={campaignId} />
          } />
          <Route path="/locations" element={
            <LocationsTab locations={locations} campaignId={campaignId} />
          } />
          <Route path="/map" element={
            <MapTab locations={locations} campaignId={campaignId} />
          } />
        </Routes>
      </Container>

      {/* Render CampaignDialog for editing */}
      {editingCampaign && ( // Conditionally render based on editingCampaign
        <CampaignDialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          onUpdate={handleUpdateCampaign}
          campaign={editingCampaign}
          onInputChange={handleEditInputChange}
          onImageUpdate={handleEditImageUpdate}
          onTagInput={handleEditTagInput}
          isEditMode={true}
          actionInProgress={actionInProgress}
        />
      )}
    </Layout>
  );
};

export default CampaignDashboard;

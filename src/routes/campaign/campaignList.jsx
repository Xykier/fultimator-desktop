import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Grid,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Zoom,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  EditNote as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { addCampaign, getCampaigns, deleteCampaign } from "../../utility/db";
import LoadingPage from "../../components/common/LoadingPage";
import Layout from "../../components/Layout";
import CampaignCard from "../../components/campaign/campaignList/CampaignCard";
import CampaignDialog from "../../components/campaign/campaignList/CampaignDialog";
import CampaignHeader from "../../components/campaign/campaignList/CampaignHeader";
import { WorldIcon } from "../../components/icons";

const DEFAULT_CAMPAIGN_IMAGE = "/images/default-campaign.jpg";

const CampaignList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    imageUrl: "",
    tags: [],
  });

  // Fetch campaigns on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data || []);

        if (data && data.length > 0) {
          const tags = data
            .flatMap((campaign) => campaign.tags || [])
            .filter((tag) => typeof tag === "string" && tag.trim() !== "")
            .filter((tag, index, self) => self.indexOf(tag) === index);

          if (tags.length > 0) {
            setShowFilters(true);
          }
        }
      } catch (error) {
        console.error("Failed to load campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // Handlers
  const handleMenuOpen = (event, campaign) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewCampaign({
      name: "",
      description: "",
      imageUrl: "",
      tags: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpdate = (newImageUrl) => {
    setNewCampaign((prev) => ({
      ...prev,
      imageUrl: newImageUrl || DEFAULT_CAMPAIGN_IMAGE,
    }));
  };

  const handleTagInput = (e) => {
    const tagsString = e.target.value;
    const tagArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    setNewCampaign((prev) => ({
      ...prev,
      tags: tagArray,
    }));
  };

  const handleTagFilter = (tag) => {
    setActiveTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleCreateCampaign = async () => {
    try {
      setActionInProgress(true);
      const campaign = { ...newCampaign };

      if (!campaign.imageUrl) {
        campaign.imageUrl = DEFAULT_CAMPAIGN_IMAGE;
      }

      if (typeof campaign.tags === "string") {
        campaign.tags = campaign.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }

      campaign.createdAt = new Date().toISOString();
      const campaignId = await addCampaign(campaign);
      setCampaigns((prev) => [...prev, { ...campaign, id: campaignId }]);
      handleCreateDialogClose();
      //navigate(`/campaign/${campaignId}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    try {
      setActionInProgress(true);
      await deleteCampaign(selectedCampaign.id);
      setCampaigns(campaigns.filter((c) => c.id !== selectedCampaign.id));
      handleDeleteDialogClose();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };

  // Get all unique tags from campaigns
  const uniqueTags = useMemo(() => {
    const allTags = campaigns
      .flatMap((campaign) => campaign.tags || [])
      .filter((tag) => typeof tag === "string" && tag.trim() !== "")
      .filter((tag, index, self) => self.indexOf(tag) === index)
      .sort();

    return allTags;
  }, [campaigns]);

  // Filter campaigns based on search term and tags
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      // Search term filter
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.description &&
          campaign.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (campaign.tags &&
          campaign.tags.some(
            (tag) =>
              typeof tag === "string" &&
              tag.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      // Tag filter
      const matchesTags =
        activeTags.length === 0 ||
        (campaign.tags &&
          activeTags.every((tag) =>
            campaign.tags.some(
              (campaignTag) =>
                typeof campaignTag === "string" &&
                campaignTag.toLowerCase() === tag.toLowerCase()
            )
          ));

      return matchesSearch && matchesTags;
    });
  }, [campaigns, searchTerm, activeTags]);

  // Sort campaigns based on selected option
  const sortedCampaigns = useMemo(() => {
    return [...filteredCampaigns].sort((a, b) => {
      switch (sortBy) {
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "recent":
          return new Date(b.lastPlayedAt || 0) - new Date(a.lastPlayedAt || 0);
        case "created":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [filteredCampaigns, sortBy]);

  if (loading) {
    return <LoadingPage />;
  }

  // Empty state component
  const EmptyState = () => (
    <Box
      sx={{
        p: 4,
        borderRadius: 2,
        textAlign: "center",
        my: 4,
        bgcolor: theme.palette.background.paper,
        border: `1px dashed ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: theme.palette.primary.light,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
        }}
      >
        <WorldIcon
          color={theme.palette.primary.contrastText}
          size = "10em"
        />
      </Box>

      <Typography variant="h3" gutterBottom fontWeight="medium">
        {searchTerm || activeTags.length > 0
          ? "No campaigns match your search"
          : "Your adventure begins here!"}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 450, mx: "auto", mb: 2 }}
      >
        {searchTerm || activeTags.length > 0
          ? "Try changing your search terms or filters to find what you're looking for."
          : "Create your first campaign to start tracking your adventures, characters, and worlds."}
      </Typography>

      {!searchTerm && activeTags.length === 0 && (
        <Zoom in={true} style={{ transitionDelay: "200ms" }}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Create Your First Campaign
          </Button>
        </Zoom>
      )}
    </Box>
  );

  return (
    <Layout fullWidth>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 10 }}>
        <CampaignHeader
          hasCampaigns={campaigns.length > 0}
          searchTerm={searchTerm}
          sortBy={sortBy}
          showFilters={showFilters}
          uniqueTags={uniqueTags}
          activeTags={activeTags}
          onCreateClick={handleCreateDialogOpen}
          onSearchChange={setSearchTerm}
          onSortChange={setSortBy}
          onClearSearch={() => setSearchTerm("")}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          onTagFilter={handleTagFilter}
          onClearFilters={() => setActiveTags([])}
        />

        {/* Campaign Grid */}
        {sortedCampaigns.length > 0 ? (
          <Grid container spacing={3}>
            {sortedCampaigns.map((campaign) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={campaign.id}
                sx={{ display: "flex" }}
              >
                <CampaignCard
                  campaign={campaign}
                  onMenuOpen={handleMenuOpen}
                  onClick={handleCampaignClick}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState />
        )}

        {/* Floating Action Button - only on mobile or when there are campaigns */}
        {(isMobile || sortedCampaigns.length > 0) && (
          <Zoom in={true}>
            <Fab
              color="primary"
              aria-label="add campaign"
              onClick={handleCreateDialogOpen}
              sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
                boxShadow: 4,
              }}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        )}

        {/* Campaign Options Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          elevation={3}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              if (selectedCampaign) {
                navigate(`/campaign/${selectedCampaign.id}/edit`);
              }
            }}
            sx={{ gap: 1 }}
          >
            <EditIcon fontSize="small" />
            Edit Campaign
          </MenuItem>
          <MenuItem onClick={handleDeleteDialogOpen} sx={{ gap: 1 }}>
            <DeleteIcon fontSize="small" color="error" />
            <Typography color="error">Delete</Typography>
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          PaperProps={{
            sx: { borderRadius: 2 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>Delete Campaign</DialogTitle>
          <DialogContent>
            {selectedCampaign && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={selectedCampaign.imageUrl || DEFAULT_CAMPAIGN_IMAGE}
                  variant="rounded"
                  sx={{ width: 48, height: 48, mr: 2 }}
                />
                <Typography variant="h6">{selectedCampaign.name}</Typography>
              </Box>
            )}
            <DialogContentText
              sx={{ display: "flex", alignItems: "flex-start" }}
            >
              <InfoIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
              <Typography variant="body2">
                This will permanently remove all campaign data, sessions, notes,
                and location information. This action cannot be undone.
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleDeleteDialogClose}
              variant="outlined"
              disabled={actionInProgress}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCampaign}
              color="error"
              variant="contained"
              disabled={actionInProgress}
              sx={{ minWidth: 100 }}
            >
              {actionInProgress ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Campaign Dialog */}
        <CampaignDialog
          open={createDialogOpen}
          onClose={handleCreateDialogClose}
          onCreate={handleCreateCampaign}
          campaign={newCampaign}
          onInputChange={handleInputChange}
          onImageUpdate={handleImageUpdate}
          onTagInput={handleTagInput}
          actionInProgress={actionInProgress}
        />
      </Container>
    </Layout>
  );
};

export default CampaignList;

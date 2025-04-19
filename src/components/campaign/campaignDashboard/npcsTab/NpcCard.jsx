import React, { useState } from "react";
import {
  Card,
  CardActions,
  CardMedia,
  Grid,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Button,
  Divider,
  ToggleButtonGroup, // Added import
  ToggleButton, // Added import
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaEdit, FaStickyNote } from "react-icons/fa";
import NpcPretty from "../../../npc/Pretty";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import FolderIcon from "@mui/icons-material/Folder";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { LinkOff } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search"; // Lens icon
import StarIcon from "@mui/icons-material/Star"; // Level icon
import ReportProblemIcon from "@mui/icons-material/ReportProblem"; // Villain placeholder
import {
  GiRaiseZombie,
  GiWolfHead,
  GiRobotGolem,
  GiEvilBat,
  GiFire,
  GiSwordwoman,
  GiGooeyDaemon,
  GiRose,
} from "react-icons/gi"; // Species icons

// Map species names to icons
const speciesIconMap = {
  Beast: GiWolfHead,
  Construct: GiRobotGolem,
  Demon: GiEvilBat,
  Elemental: GiFire,
  Humanoid: GiSwordwoman,
  Undead: GiRaiseZombie,
  Plant: GiRose,
  Monster: GiGooeyDaemon,
};

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%", // Ensure card takes full height of grid item
  minHeight: 180, // Adjust as needed for minimum size
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const CompactCardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: "center",
  flexGrow: 1, // Allow content to grow
  display: "flex",
  flexDirection: "column",
  justifyContent: "center", // Center content vertically
  alignItems: "center", // Center content horizontally
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
}));

const NpcCard = ({
  npc,
  onEdit,
  onUnlink,
  onNotes,
  onSetAttitude,
  folders,
  onMoveToFolder,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [attitude, setAttitude] = useState(npc.attitude || "neutral");
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [moveFolderDialogOpen, setMoveFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveFolderOpen = () => {
    setMoveFolderDialogOpen(true);
    handleMenuClose();
  };

  const handleFolderChange = (event) => {
    setSelectedFolder(event.target.value);
  };

  const handleMoveFolderClose = () => {
    setMoveFolderDialogOpen(false);
  };

  const handleMoveToFolder = () => {
    if (onMoveToFolder) {
      onMoveToFolder(npc.id, selectedFolder);
    }
    handleMoveFolderClose();
  };

  const handleAttitudeChange = (event, newAttitude) => {
    if (newAttitude !== null) {
      setAttitude(newAttitude);
      if (onSetAttitude) {
        onSetAttitude(npc.id, newAttitude);
      }
      // No need to close menu here as it's inside the menu itself
    }
  };

  const handleDetailsOpen = () => {
    setDetailsDialogOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
  };

  const SpeciesIcon = speciesIconMap[npc.species] || Box; // Default to Box if no icon found

  return (
    <React.Fragment>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        {" "}
        {/* Adjust grid sizing for compactness */}
        <StyledCard
          elevation={2}
          onDoubleClick={!isMobile ? handleDetailsOpen : undefined} // Add double-click handler for desktop
        >
          <CardMedia
            component="img"
            height="80" // Adjust height as needed
            image={npc.imgurl || "/logo192.png"} // Updated placeholder image path
            alt={npc.name}
            sx={{ objectFit: "contain", paddingTop: "5px" }} // Contain ensures image fits
          />
          <CompactCardContent>
            <Tooltip title={npc.name}>
              <Typography
                variant="body2" // Smaller font size
                noWrap // Prevent text wrapping
                sx={{ fontWeight: "bold", width: "100%" }} // Ensure it takes full width for ellipsis
              >
                {npc.name}
              </Typography>
            </Tooltip>
            <IconContainer>
              <Tooltip title={`Level: ${npc.lvl}`}>
                <StarIcon sx={{ fontSize: "1rem", color: "goldenrod" }} />
              </Tooltip>
              <Tooltip title={npc.species}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SpeciesIcon style={{ fontSize: "1rem" }} />
                </Box>
              </Tooltip>
              {npc.villain && ( // Conditionally render villain icon
                <Tooltip title={`Villain: ${npc.villain}`}>
                  <ReportProblemIcon
                    sx={{ fontSize: "1rem", color: "error.main" }}
                  />
                </Tooltip>
              )}
            </IconContainer>
          </CompactCardContent>
          <CardActions
            sx={{
              justifyContent: "space-between",
              padding: theme.spacing(0, 0.5, 0.5),
            }}
          >
            {" "}
            {/* Reduced padding */}
            <Box>
              <Tooltip title="Edit NPC">
                <IconButton
                  onClick={() => onEdit && onEdit(npc.id)}
                  size="small"
                >
                  <FaEdit style={{ fontSize: "0.8rem" }} /> {/* Smaller icon */}
                </IconButton>
              </Tooltip>
              <Tooltip title="Notes">
                <IconButton
                  onClick={() => onNotes && onNotes(npc.id)}
                  size="small"
                >
                  <FaStickyNote style={{ fontSize: "0.8rem" }} />{" "}
                  {/* Smaller icon */}
                </IconButton>
              </Tooltip>

              <Tooltip title="View Details">
                <IconButton onClick={handleDetailsOpen} size="small">
                  <SearchIcon style={{ fontSize: "0.9rem" }} />{" "}
                  {/* Lens icon */}
                </IconButton>
              </Tooltip>
            </Box>
            <div>
              <Tooltip title="More options">
                <IconButton
                  aria-label="more options"
                  id={`npc-menu-button-${npc.id}`} // Unique ID per card
                  aria-controls={menuOpen ? `npc-menu-${npc.id}` : undefined}
                  aria-expanded={menuOpen ? "true" : undefined}
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                  size="small"
                >
                  <MoreVertIcon style={{ fontSize: "1rem" }} />{" "}
                  {/* Smaller icon */}
                </IconButton>
              </Tooltip>
              <Menu
                id={`npc-menu-${npc.id}`} // Unique ID per card
                MenuListProps={{
                  "aria-labelledby": `npc-menu-button-${npc.id}`,
                  dense: true,
                }}
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                }}
              >
                {/* Keep existing menu items */}
                <MenuItem
                  onClick={() => {
                    onEdit && onEdit(npc.id);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit NPC</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onUnlink && onUnlink(npc.id);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <LinkOff fontSize="small" color="error" sx={{ mr: 1 }} />
                  </ListItemIcon>
                  <ListItemText>Unlink from Campaign</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMoveFolderOpen}>
                  <ListItemIcon>
                    <FolderIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Move to Folder</ListItemText>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                {/* Attitude Toggle - Keep inside menu */}
                <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
                  <ToggleButtonGroup
                    value={attitude}
                    exclusive
                    onChange={handleAttitudeChange}
                    aria-label="NPC attitude"
                    size="small"
                  >
                    <ToggleButton
                      value="friendly"
                      aria-label="friendly attitude"
                    >
                      <Tooltip title="Friendly">
                        <SentimentSatisfiedAltIcon
                          fontSize="small"
                          color={attitude === "friendly" ? "success" : "action"}
                        />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="neutral" aria-label="neutral attitude">
                      <Tooltip title="Neutral">
                        <SentimentNeutralIcon
                          fontSize="small"
                          color={attitude === "neutral" ? "primary" : "action"}
                        />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="hostile" aria-label="hostile attitude">
                      <Tooltip title="Hostile">
                        <SentimentVeryDissatisfiedIcon
                          fontSize="small"
                          color={attitude === "hostile" ? "error" : "action"}
                        />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Menu>
            </div>
          </CardActions>
        </StyledCard>
      </Grid>

      {/* Move Folder Dialog */}
      <Dialog open={moveFolderDialogOpen} onClose={handleMoveFolderClose}>
        <DialogTitle>Move to Folder</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 1 }}>
          <Select
            value={selectedFolder}
            onChange={handleFolderChange}
            fullWidth
            displayEmpty
            variant="outlined"
            size="small"
          >
            <MenuItem value="">
              <em>None (Root)</em>
            </MenuItem>
            {folders &&
              folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.name}
                </MenuItem>
              ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMoveFolderClose}>Cancel</Button>
          <Button
            onClick={handleMoveToFolder}
            variant="contained"
            color="primary"
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>

      {/* NPC Details Dialog (for mobile) */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        maxWidth="lg" // Adjust as needed
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>{npc.name} Details</DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          {/* Render NpcPretty inside the dialog */}
          <NpcPretty npc={npc} collapse={true} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default NpcCard;

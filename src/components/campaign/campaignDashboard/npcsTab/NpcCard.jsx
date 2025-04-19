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
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import FolderIcon from "@mui/icons-material/Folder";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { LinkOff } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import NpcDetailDialog from "./NpcDetailDialog";
import NpcMoveFolderDialog from "./NpcMoveFolderDialog";
import { getSpeciesIcon, getRankIcon } from "../../../../libs/npcIcons";

// Standardized icon size constant
const ICON_SIZE = 16; // Set all icons to be 16px


const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
  minHeight: 200,
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const CompactCardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: "center",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

const LevelBadge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: "12px",
  padding: theme.spacing(0, 1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  height: 20, // Fixed height for consistency
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

// Custom styled icon wrapper for consistent sizing
const StyledIcon = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: ICON_SIZE,
  height: ICON_SIZE,
  "& > *": {
    fontSize: `${ICON_SIZE}px !important`,
  },
}));

const StyledIconButton = styled(IconButton)(() => ({
  padding: 4,
  "& > *": {
    fontSize: `${ICON_SIZE}px !important`,
  },
}));

const getRankName = (rank) => {
  if (rank && rank.startsWith("champion")) {
    const level = rank.charAt(rank.length - 1);
    return `Champion ${level}`;
  }
  return rank ? rank.charAt(0).toUpperCase() + rank.slice(1) : "";
};

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
    }
  };

  const handleDetailsOpen = () => {
    setDetailsDialogOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
  };

  const SpeciesIcon = getSpeciesIcon(npc.species);

  // Get rank icon and color
  const rankInfo = getRankIcon(npc.rank || "soldier");
  const RankIcon = rankInfo.icon;
  const rankColor = rankInfo.color;
  const rankName = getRankName(npc.rank || "soldier");

  return (
    <React.Fragment>
      <Grid item xs={6} sm={4} md={3} lg={2}>
        <StyledCard
          elevation={2}
          onDoubleClick={!isMobile ? handleDetailsOpen : undefined}
        >
          <CardMedia
            component="img"
            height="80"
            image={npc.imgurl || "/logo192.png"}
            alt={npc.name}
            sx={{ objectFit: "contain", paddingTop: "5px" }}
          />
          <CompactCardContent>
            <Tooltip title={npc.name}>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: "bold",
                  width: "100%",
                  color: theme.palette.text.primary,
                }}
              >
                {npc.name}
              </Typography>
            </Tooltip>

            <IconContainer>
              {/* Prominent Level Badge */}
              <Tooltip title={`Level: ${npc.lvl}`}>
                <LevelBadge>
                  <Typography
                    variant="body2"
                    color={theme.palette.primary.contrastText}
                    sx={{ lineHeight: 1 }}
                  >
                    {npc.lvl}
                  </Typography>
                </LevelBadge>
              </Tooltip>

              {/* Rank Badge */}
              <Tooltip title={rankName}>
                <StyledIcon sx={{ color: rankColor }}>
                  <RankIcon />
                </StyledIcon>
              </Tooltip>

              {/* Species Icon */}
              {SpeciesIcon && (
                <Tooltip title={npc.species}>
                  <StyledIcon>
                    <SpeciesIcon />
                  </StyledIcon>
                </Tooltip>
              )}

              {/* Villain Badge */}
              {npc.villain && (
                <Tooltip title={`Villain: ${npc.villain}`}>
                  <StyledIcon sx={{ color: theme.palette.error.main }}>
                    <ReportProblemIcon />
                  </StyledIcon>
                </Tooltip>
              )}
            </IconContainer>
          </CompactCardContent>

          <CardActions
            sx={{
              justifyContent: "space-between",
              padding: theme.spacing(0.5),
            }}
          >
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Edit NPC">
                <StyledIconButton
                  onClick={() => onEdit && onEdit(npc.id)}
                  size="small"
                >
                  <EditIcon />
                </StyledIconButton>
              </Tooltip>

              <Tooltip title="Notes">
                <StyledIconButton
                  onClick={() => onNotes && onNotes(npc.id)}
                  size="small"
                >
                  <StickyNote2Icon />
                </StyledIconButton>
              </Tooltip>

              <Tooltip title="View Details">
                <StyledIconButton onClick={handleDetailsOpen} size="small">
                  <SearchIcon />
                </StyledIconButton>
              </Tooltip>
            </Box>

            <Tooltip title="More options">
              <StyledIconButton
                aria-label="more options"
                id={`npc-menu-button-${npc.id}`}
                aria-controls={menuOpen ? `npc-menu-${npc.id}` : undefined}
                aria-expanded={menuOpen ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleMenuClick}
                size="small"
              >
                <MoreVertIcon />
              </StyledIconButton>
            </Tooltip>

            <Menu
              id={`npc-menu-${npc.id}`}
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
              <MenuItem
                onClick={() => {
                  onEdit && onEdit(npc.id);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <EditIcon sx={{ fontSize: ICON_SIZE }} />
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
                  <LinkOff
                    sx={{
                      fontSize: ICON_SIZE,
                      color: theme.palette.error.main,
                    }}
                  />
                </ListItemIcon>
                <ListItemText>Unlink from Campaign</ListItemText>
              </MenuItem>

              <MenuItem onClick={handleMoveFolderOpen}>
                <ListItemIcon>
                  <FolderIcon sx={{ fontSize: ICON_SIZE }} />
                </ListItemIcon>
                <ListItemText>Move to Folder</ListItemText>
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
                <ToggleButtonGroup
                  value={attitude}
                  exclusive
                  onChange={handleAttitudeChange}
                  aria-label="NPC attitude"
                  size="small"
                >
                  <ToggleButton value="friendly" aria-label="friendly attitude">
                    <Tooltip title="Friendly">
                      <SentimentSatisfiedAltIcon
                        sx={{
                          fontSize: ICON_SIZE,
                          color:
                            attitude === "friendly"
                              ? theme.palette.success.main
                              : theme.palette.action.active,
                        }}
                      />
                    </Tooltip>
                  </ToggleButton>

                  <ToggleButton value="neutral" aria-label="neutral attitude">
                    <Tooltip title="Neutral">
                      <SentimentNeutralIcon
                        sx={{
                          fontSize: ICON_SIZE,
                          color:
                            attitude === "neutral"
                              ? theme.palette.primary.main
                              : theme.palette.action.active,
                        }}
                      />
                    </Tooltip>
                  </ToggleButton>

                  <ToggleButton value="hostile" aria-label="hostile attitude">
                    <Tooltip title="Hostile">
                      <SentimentVeryDissatisfiedIcon
                        sx={{
                          fontSize: ICON_SIZE,
                          color:
                            attitude === "hostile"
                              ? theme.palette.error.main
                              : theme.palette.action.active,
                        }}
                      />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Menu>
          </CardActions>
        </StyledCard>
      </Grid>

      {/* Move Folder Dialog */}
      <NpcMoveFolderDialog
        open={moveFolderDialogOpen}
        onClose={handleMoveFolderClose}
        selectedFolder={selectedFolder}
        folders={folders}
        handleFolderChange={handleFolderChange}
        handleMoveToFolder={handleMoveToFolder}
      />

      {/* NPC Details Dialog */}
      <NpcDetailDialog
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        npc={npc}
      />
    </React.Fragment>
  );
};

export default NpcCard;

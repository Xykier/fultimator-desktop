import React, { useState } from "react";
import {
  Card,
  CardActions,
  CardMedia,
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
  Checkbox,
  Fade,
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
import { getSpeciesIcon, getRankIcon } from "../../../../libs/npcIcons";
import { useNpcActions } from "./hooks/useNpcActions";
import { useNpcStore } from "./stores/npcDataStore";

// Standardized icon size constant
const ICON_SIZE = 16; // Set all icons to be 16px

const StyledCard = styled(Card)(({ theme, selected }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
  minHeight: 200,
  transition: "transform 0.2s, box-shadow 0.2s",
  position: "relative",
  border: selected ? `2px solid ${theme.palette.primary.main}` : "none",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const SelectionCheckbox = styled(Box)(() => ({
  position: "absolute",
  top: 8,
  left: 8,
  zIndex: 2,
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  borderRadius: "50%",
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

const CardOverlay = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.04)",
  zIndex: 1,
  pointerEvents: "none",
}));

const getRankName = (rank) => {
  if (rank && rank.startsWith("champion")) {
    const level = rank.charAt(rank.length - 1);
    return `Champion ${level}`;
  }
  return rank ? rank.charAt(0).toUpperCase() + rank.slice(1) : "";
};

const NpcCard = ({
  item,
  onUnlink,
  onNotes,
  onMove,
  onSelect,
  isSelected = false,
  selectionMode = false,
}) => {
  const { campaignId, loadNpcs, showSnackbar } = useNpcStore();
  const { handleEditNpc, handleSetAttitude } = useNpcActions(
    campaignId,
    loadNpcs,
    showSnackbar
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [attitude, setAttitude] = useState(item.attitude || "neutral");
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveToFolder = () => {
    onMove && onMove(item.id);
    handleMenuClose();
  };

  const handleAttitudeChange = (event, newAttitude) => {
    if (newAttitude !== null) {
      setAttitude(newAttitude);
      handleSetAttitude(item.id, newAttitude);
    }
  };

  const handleDetailsOpen = (e) => {
    e.stopPropagation();
    setDetailsDialogOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
  };

  const handleCardClick = (e) => {
    if (selectionMode && onSelect) {
      onSelect(item.id, !isSelected);
    } else if (!isMobile) {
      handleDetailsOpen(e);
    }
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(item.id, !isSelected);
    }
  };

  const SpeciesIcon = getSpeciesIcon(item.species);

  // Get rank icon and color
  const rankInfo = getRankIcon(item.rank || "soldier");
  const RankIcon = rankInfo.icon;
  const rankColor = rankInfo.color;
  const rankName = getRankName(item.rank || "soldier");


  return (
    <React.Fragment>
      <StyledCard
        elevation={2}
        onClick={handleCardClick}
        selected={isSelected}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Selection checkbox - always visible when in selection mode or visible on hover */}
        <Fade in={selectionMode || isHovered || isSelected}>
          <SelectionCheckbox>
            <Checkbox
              checked={isSelected}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              color="primary"
              size="small"
            />
          </SelectionCheckbox>
        </Fade>

        {/* Show a subtle overlay when selected */}
        {isSelected && <CardOverlay />}

        <CardMedia
          component="img"
          height="80"
          image={item.imgurl || "/logo192.png"}
          alt={item.name}
          sx={{ objectFit: "contain", paddingTop: "5px" }}
        />
        <CompactCardContent>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: "bold",
              width: "100%",
              color: theme.palette.text.primary,
            }}
          >
            {item.name}
          </Typography>

          <IconContainer>
            {/* Prominent Level Badge */}
            <Tooltip title={`Level: ${item.lvl}`}>
              <LevelBadge>
                <Typography
                  variant="body2"
                  color={theme.palette.primary.contrastText}
                  sx={{ lineHeight: 1 }}
                >
                  {item.lvl}
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
              <Tooltip title={item.species}>
                <StyledIcon>
                  <SpeciesIcon />
                </StyledIcon>
              </Tooltip>
            )}

            {/* Villain Badge */}
            {item.villain && (
              <Tooltip title={`Villain: ${item.villain}`}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditNpc(item.id);
                }}
                size="small"
              >
                <EditIcon />
              </StyledIconButton>
            </Tooltip>

            <Tooltip title="Notes">
              <StyledIconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onNotes && onNotes(item.id);
                }}
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
              id={`npc-menu-button-${item.id}`}
              aria-controls={menuOpen ? `npc-menu-${item.id}` : undefined}
              aria-expanded={menuOpen ? "true" : undefined}
              aria-haspopup="true"
              onClick={handleMenuClick}
              size="small"
            >
              <MoreVertIcon />
            </StyledIconButton>
          </Tooltip>

          <Menu
            id={`npc-menu-${item.id}`}
            MenuListProps={{
              "aria-labelledby": `npc-menu-button-${item.id}`,
              dense: true,
            }}
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem
              onClick={() => {
                handleEditNpc(item.id);
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
                onUnlink && onUnlink(item.id);
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

            <MenuItem onClick={handleMoveToFolder}>
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

      {/* NPC Details Dialog */}
      <NpcDetailDialog
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        npc={item}
      />
    </React.Fragment>
  );
};

export default NpcCard;

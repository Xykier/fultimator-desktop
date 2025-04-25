import React, { useState } from "react";
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  Tooltip,
  Box,
  Menu,
  MenuItem,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
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
const ICON_SIZE = 16;

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  transition: "background-color 0.2s",
  border: selected
    ? `1px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected
    ? theme.palette.action.selected
    : theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
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
  height: 20,
  minWidth: 24,
  fontSize: "0.75rem",
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const SelectionCheckbox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const getRankName = (rank) => {
  if (rank && rank.startsWith("champion")) {
    const level = rank.charAt(rank.length - 1);
    return `Champion ${level}`;
  }
  return rank ? rank.charAt(0).toUpperCase() + rank.slice(1) : "";
};

const NpcListItem = ({
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

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(item.id, !isSelected);
    }
  };

  const handleListItemClick = () => {
    if (selectionMode && onSelect) {
      onSelect(item.id, !isSelected);
    } else {
      handleDetailsOpen({ stopPropagation: () => {} });
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
      <StyledListItem
        selected={isSelected}
        onClick={handleListItemClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          {/* Selection checkbox - visible when in selection mode or on hover */}
          <Fade in={selectionMode || isHovered || isSelected}>
            <SelectionCheckbox>
              <Checkbox
                checked={isSelected}
                onChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
                size="small"
              />
            </SelectionCheckbox>
          </Fade>

          {/* Avatar */}
          <ListItemAvatar>
            <Avatar
              alt={item.name}
              src={item.imgurl || "/logo192.png"}
              variant="rounded"
              sx={{ width: 40, height: 40 }}
            />
          </ListItemAvatar>

          {/* NPC Info */}
          <ListItemText
            primary={
              <Typography variant="subtitle1" fontWeight="medium">
                {item.name}
              </Typography>
            }
            secondary={
              <IconContainer>
                <LevelBadge>{item.lvl}</LevelBadge>

                <Tooltip title={rankName}>
                  <Box sx={{ color: rankColor }}>
                    <RankIcon sx={{ fontSize: ICON_SIZE }} />
                  </Box>
                </Tooltip>

                {SpeciesIcon && (
                  <Tooltip title={item.species}>
                    <Box>
                      <SpeciesIcon sx={{ fontSize: ICON_SIZE }} />
                    </Box>
                  </Tooltip>
                )}

                {item.villain && (
                  <Tooltip title={`Villain: ${item.villain}`}>
                    <ReportProblemIcon
                      sx={{
                        fontSize: ICON_SIZE,
                        color: (theme) => theme.palette.error.main,
                      }}
                    />
                  </Tooltip>
                )}
              </IconContainer>
            }
          />

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
            <Tooltip title="Edit NPC">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditNpc(item.id);
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notes">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onNotes && onNotes(item.id);
                }}
                size="small"
              >
                <StickyNote2Icon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Details">
              <IconButton onClick={handleDetailsOpen} size="small">
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="More options">
              <IconButton
                aria-label="more options"
                id={`npc-menu-button-${item.id}`}
                aria-controls={menuOpen ? `npc-menu-${item.id}` : undefined}
                aria-expanded={menuOpen ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleMenuClick}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </StyledListItem>

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
      >
        <MenuItem
          onClick={() => {
            handleEditNpc(item.id);
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
            onUnlink && onUnlink(item.id);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <LinkOff fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Unlink from Campaign</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMoveToFolder}>
          <ListItemIcon>
            <FolderIcon fontSize="small" />
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
                        ? (theme) => theme.palette.success.main
                        : (theme) => theme.palette.action.active,
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
                        ? (theme) => theme.palette.primary.main
                        : (theme) => theme.palette.action.active,
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
                        ? (theme) => theme.palette.error.main
                        : (theme) => theme.palette.action.active,
                  }}
                />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Menu>

      {/* NPC Details Dialog */}
      <NpcDetailDialog
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        npc={item}
      />
    </React.Fragment>
  );
};

export default NpcListItem;

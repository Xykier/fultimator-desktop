import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  ToggleButtonGroup,
  Tooltip,
  Divider,
  ToggleButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  StickyNote2 as StickyNote2Icon,
  ReportProblem as ReportProblemIcon,
} from "@mui/icons-material";
import { LinkOff } from "@mui/icons-material";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import FolderIcon from "@mui/icons-material/Folder";
import { useNpcFoldersStore } from "./stores/npcFolderStore";
import NpcDetailDialog from "./NpcDetailDialog";
import NpcMoveFolderDialog from "./NpcMoveFolderDialog";
import { getSpeciesIcon, getRankIcon } from "../../../../libs/npcIcons";

// Standardized icon size constant
const ICON_SIZE = 16; // Set all icons to be 16px

const NpcListItem = ({
  npc,
  handleExpandNpc,
  onEdit,
  onUnlink,
  onSetAttitude,
  onNotes,
  folders,
}) => {
  const { moveNpcToFolder } = useNpcFoldersStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [attitude, setAttitude] = useState(npc.attitude || "neutral");
  const [moveFolderDialogOpen, setMoveFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Menu state
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
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
    setSelectedFolder("");
  };

  const handleMoveToFolder = (folderId) => {
    moveNpcToFolder(npc.id, folderId);
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

  const handleDetailsOpen = (event) => {
    event.stopPropagation();
    setDetailsDialogOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
  };

  const attitudeColors = {
    friendly: "success",
    neutral: "info",
    hostile: "error",
  };

  const getVillainLabel = () => {
    switch (npc.villain) {
      case "minor":
        return "Minor Villain";
      case "major":
        return "Major Villain";
      case "superior":
        return "Superior Villain";
      default:
        return null;
    }
  };

  const villainLabel = getVillainLabel();

  // Get species icon
  const SpeciesIcon = getSpeciesIcon(npc.species);

  // Get rank icon and color
  const rankInfo = getRankIcon(npc.rank || "soldier");
  const RankIcon = rankInfo.icon;
  const rankColor = rankInfo.color;
  const rankName = npc.rank ? 
    (npc.rank.startsWith("champion") ? 
      `Champion ${npc.rank.charAt(npc.rank.length - 1)}` : 
      npc.rank.charAt(0).toUpperCase() + npc.rank.slice(1)) : 
    "";

  const handleEditClick = (event) => {
    event.stopPropagation();
    onEdit && onEdit(npc.id);
  };

  const handleNotesClick = (event) => {
    event.stopPropagation();
    onNotes && onNotes(npc.id);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[3],
        },
      }}
      onClick={() => handleExpandNpc(npc.id)}
      onDoubleClick={!isMobile ? handleDetailsOpen : undefined}
    >
      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        <Avatar
          sx={{
            bgcolor: "#fff",
            border: "1px solid #ccc",
            width: 48,
            height: 48,
            ml: 2,
          }}
          src={npc.imgurl || "/logo192.png"}
          alt={npc.name}
        />

        <CardContent sx={{ flex: 1, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: 500 }}
            >
              {npc.name}
            </Typography>

            <Box sx={{ display: "flex", ml: "auto", gap: 1, flexWrap: "wrap" }}>
              {/* Level Badge */}
              <Chip
                size="small"
                label={`Lvl ${npc.lvl}`}
                color="primary"
                variant="filled"
                sx={{ 
                  minWidth: '50px', 
                  height: '20px',
                  '& .MuiChip-label': {
                    padding: '0 8px',
                  }
                }}
              />

              {/* Attitude Chip */}
              {npc.attitude && (
                <Chip
                  size="small"
                  label={
                    npc.attitude.charAt(0).toUpperCase() + npc.attitude.slice(1)
                  }
                  color={attitudeColors[npc.attitude] || "default"}
                  variant="outlined"
                  sx={{ height: '20px' }}
                />
              )}

              {/* Villain Chip */}
              {villainLabel && (
                <Chip
                  size="small"
                  label={villainLabel}
                  color="warning"
                  variant="outlined"
                  icon={<ReportProblemIcon sx={{ fontSize: ICON_SIZE }} />}
                  sx={{ height: '20px' }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {/* Species with inline icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              {SpeciesIcon && (
                <Tooltip title={npc.species}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                    <SpeciesIcon sx={{ fontSize: ICON_SIZE }} />
                  </Box>
                </Tooltip>
              )}
              <Typography variant="body2" color="text.secondary">
                {npc.species}
              </Typography>
            </Box>
            
            {/* Bullet separator if both species and rank exist */}
            {npc.species && rankName && (
              <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
                •
              </Typography>
            )}
            
            {/* Rank with inline icon */}
            {rankName && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {RankIcon && (
                  <Tooltip title={rankName}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                      <RankIcon sx={{ fontSize: ICON_SIZE, color: rankColor }} />
                    </Box>
                  </Tooltip>
                )}
                <Typography variant="body2" color="text.secondary">
                  {rankName}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <Box sx={{ display: "flex", alignItems: "center", pr: 1, gap: 0.5 }}>
          <Tooltip title="Edit NPC">
            <IconButton
              size="small"
              onClick={handleEditClick}
              sx={{ padding: 0.5 }}
            >
              <EditIcon sx={{ fontSize: ICON_SIZE }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notes">
            <IconButton
              size="small"
              onClick={handleNotesClick}
              sx={{ padding: 0.5 }}
            >
              <StickyNote2Icon sx={{ fontSize: ICON_SIZE }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={handleDetailsOpen}
              sx={{ padding: 0.5 }}
            >
              <SearchIcon sx={{ fontSize: ICON_SIZE }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="More options">
            <IconButton
              aria-label="npc options"
              size="small"
              onClick={handleMenuClick}
              id={`npc-menu-button-${npc.id}`}
              aria-controls={menuOpen ? `npc-menu-${npc.id}` : undefined}
              aria-expanded={menuOpen ? "true" : undefined}
              aria-haspopup="true"
              sx={{ padding: 0.5 }}
            >
              <MoreVertIcon sx={{ fontSize: ICON_SIZE }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Menu
        id={`npc-menu-${npc.id}`}
        MenuListProps={{
          "aria-labelledby": `npc-menu-button-${npc.id}`,
          dense: true,
        }}
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
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

      {/* Move Folder Dialog */}
      <NpcMoveFolderDialog
        open={moveFolderDialogOpen}
        onClose={handleMoveFolderClose}
        selectedFolder={selectedFolder}
        folders={folders}
        handleFolderChange={handleFolderChange}
        handleMoveToFolder={handleMoveToFolder}
        currentFolderId={npc.folderId}
      />

      {/* NPC Details Dialog */}
      <NpcDetailDialog
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        npc={npc}
      />
    </Card>
  );
};

export default NpcListItem;
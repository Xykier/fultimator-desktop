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
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  LinkOff as LinkOffIcon,
  FolderOpen as FolderOpenIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";

const NpcListItem = ({
  npc,
  handleExpandNpc,
  onEdit,
  onUnlink,
  onSetAttitude,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // Menu state


  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(npc.id);
    handleMenuClose();
  };

  const handleRemove = () => {
    onUnlink(npc.id);
    handleMenuClose();
  };

  const handleAttitudeChange = (attitude) => {
    onSetAttitude(npc.id, attitude);
    handleMenuClose();
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

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        cursor: "pointer",
        "&:hover": {
          boxShadow: 1,
        },
      }}
      onClick={() => handleExpandNpc(npc.id)}
    >
      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        <Avatar
          sx={{
            bgcolor: npc.color || "primary.main",
            width: 40,
            height: 40,
            ml: 2,
          }}
        >
          {npc.name.charAt(0).toUpperCase()}
        </Avatar>

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
              {npc.attitude && (
                <Chip
                  size="small"
                  label={
                    npc.attitude.charAt(0).toUpperCase() + npc.attitude.slice(1)
                  }
                  color={attitudeColors[npc.attitude] || "default"}
                  variant="outlined"
                />
              )}

              {villainLabel && (
                <Chip
                  size="small"
                  label={villainLabel}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {npc.species}
            {npc.rank ? ` • ${npc.rank}` : ""}
          </Typography>
        </CardContent>

        <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
          <IconButton
            aria-label="npc options"
            size="small"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit NPC</ListItemText>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to Folder</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleAttitudeChange("friendly")}>
          <ListItemIcon>
            <ThumbUpIcon
              fontSize="small"
              color={npc.attitude === "friendly" ? "success" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText>Set Friendly</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleAttitudeChange("neutral")}>
          <ListItemIcon>
            <RemoveIcon
              fontSize="small"
              color={npc.attitude === "neutral" ? "info" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText>Set Neutral</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleAttitudeChange("hostile")}>
          <ListItemIcon>
            <ThumbDownIcon
              fontSize="small"
              color={npc.attitude === "hostile" ? "error" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText>Set Hostile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRemove} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <LinkOffIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Remove from Campaign</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default NpcListItem;

import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import FolderIcon from "@mui/icons-material/Folder";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { LinkOff } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";

// Standardized icon size
const ICON_SIZE = 18;

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(0.75, 1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[900] 
    : theme.palette.grey[50],
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ActionButtonsGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: 6,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.02)',
  "&:hover": {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
  },
  "& svg": {
    fontSize: ICON_SIZE,
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    padding: theme.spacing(0.5),
    border: 0,
    "&:not(:first-of-type)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-of-type": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  "&.Mui-selected": {
    backgroundColor: "transparent",
  },
  "& svg": {
    fontSize: ICON_SIZE,
  },
}));

const NpcCardActions = ({
  npcId,
  attitude = "neutral",
  onEdit,
  onUnlink,
  onNotes,
  onDetails,
  onMove,
  onSetAttitude,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentAttitude, setCurrentAttitude] = useState(attitude);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAttitudeChange = (event, newAttitude) => {
    if (newAttitude !== null) {
      setCurrentAttitude(newAttitude);
      onSetAttitude(newAttitude);
    }
  };
  
  const getAttitudeColor = (attitudeValue) => {
    const isSelected = currentAttitude === attitudeValue;
    
    switch (attitudeValue) {
      case "friendly":
        return isSelected ? theme.palette.success.main : theme.palette.text.disabled;
      case "neutral":
        return isSelected ? theme.palette.secondary.main : theme.palette.text.disabled;
      case "hostile":
        return isSelected ? theme.palette.error.main : theme.palette.text.disabled;
      default:
        return theme.palette.text.disabled;
    }
  };

  return (
    <ActionsContainer onClick={(e) => e.stopPropagation()}>
      <ActionButtonsGroup>
        <Tooltip title="Edit NPC" arrow>
          <StyledIconButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            size="small"
          >
            <EditIcon />
          </StyledIconButton>
        </Tooltip>

        <Tooltip title="Notes" arrow>
          <StyledIconButton
            onClick={(e) => {
              e.stopPropagation();
              onNotes();
            }}
            size="small"
          >
            <StickyNote2Icon />
          </StyledIconButton>
        </Tooltip>

        <Tooltip title="View Details" arrow>
          <StyledIconButton 
            onClick={(e) => {
              e.stopPropagation();
              onDetails(e);
            }} 
            size="small"
          >
            <SearchIcon />
          </StyledIconButton>
        </Tooltip>
      </ActionButtonsGroup>

      <Tooltip title="More options" arrow>
        <StyledIconButton
          aria-label="more options"
          id={`npc-menu-button-${npcId}`}
          aria-controls={menuOpen ? `npc-menu-${npcId}` : undefined}
          aria-expanded={menuOpen ? "true" : undefined}
          aria-haspopup="true"
          onClick={(e) => handleMenuClick(e)}
          size="small"
        >
          <MoreVertIcon />
        </StyledIconButton>
      </Tooltip>

      <Menu
        id={`npc-menu-${npcId}`}
        MenuListProps={{
          "aria-labelledby": `npc-menu-button-${npcId}`,
          dense: true,
        }}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={(e) => handleMenuClose(e)}
        PaperProps={{
          elevation: 5,
          sx: { 
            borderRadius: 2,
            minWidth: 200,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            onEdit();
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
            onUnlink();
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

        <MenuItem onClick={() => {
          onMove();
          handleMenuClose();
        }}>
          <ListItemIcon>
            <FolderIcon sx={{ fontSize: ICON_SIZE }} />
          </ListItemIcon>
          <ListItemText>Move to Folder</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ px: 1, py: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1, mb: 1, fontSize: '0.75rem' }}>
            NPC ATTITUDE
          </Typography>
          
          <StyledToggleButtonGroup
            value={currentAttitude}
            exclusive
            onChange={handleAttitudeChange}
            aria-label="NPC attitude"
            size="small"
            fullWidth
          >
            <StyledToggleButton value="friendly" aria-label="friendly attitude">
              <Tooltip title="Friendly" arrow>
                <SentimentSatisfiedAltIcon
                  sx={{ color: getAttitudeColor("friendly") }}
                />
              </Tooltip>
            </StyledToggleButton>

            <StyledToggleButton value="neutral" aria-label="neutral attitude">
              <Tooltip title="Neutral" arrow>
                <SentimentNeutralIcon
                  sx={{ color: getAttitudeColor("neutral") }}
                />
              </Tooltip>
            </StyledToggleButton>

            <StyledToggleButton value="hostile" aria-label="hostile attitude">
              <Tooltip title="Hostile" arrow>
                <SentimentVeryDissatisfiedIcon
                  sx={{ color: getAttitudeColor("hostile") }}
                />
              </Tooltip>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Box>
      </Menu>
    </ActionsContainer>
  );
};

export default NpcCardActions;
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Button
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { FaEdit, FaStickyNote } from "react-icons/fa";
import NpcPretty from "../../../npc/Pretty";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
  position: "relative",
  height: "100%",
}));

const AttitudeToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: "flex",
  justifyContent: "center",
  "& .MuiToggleButtonGroup-grouped": {
    border: 0,
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

const NpcCard = ({
  npc,
  expandedNpcId,
  handleExpandNpc,
  onEdit,
  onUnlink,
  onNotes,
  onSetAttitude,
  folders,
  onMoveToFolder,
}) => {
  const [attitude, setAttitude] = React.useState(npc.attitude || "neutral");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [moveFolderDialogOpen, setMoveFolderDialogOpen] = React.useState(false);
  const [selectedFolder, setSelectedFolder] = React.useState("");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMoveFolderOpen = () => {
    setMoveFolderDialogOpen(true);
    handleClose();
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

  // Get color based on attitude for the icon
  const getAttitudeColor = (attitudeType) => {
    switch (attitudeType) {
      case "friendly":
        return "success.main";
      case "hostile":
        return "error.main";
      default:
        return "text.secondary";
    }
  };

  return (
    <React.Fragment>
      <Grid item xs={12} sm={6} md={4}>
        <StyledCard elevation={2}>
          <CardContent>
            <NpcPretty
              npc={npc}
              collapse={expandedNpcId === npc.id}
              onClick={() => handleExpandNpc(npc.id)}
              attitude={attitude}
              onAttitudeChange={handleAttitudeChange}
            />
            
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <AttitudeToggleGroup
                value={attitude}
                exclusive
                onChange={handleAttitudeChange}
                aria-label="NPC attitude"
                size="small"
              >
                <ToggleButton value="friendly" aria-label="friendly attitude">
                  <Tooltip title="Friendly">
                    <SentimentSatisfiedAltIcon 
                      color={attitude === "friendly" ? "success" : "inherit"} 
                    />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="neutral" aria-label="neutral attitude">
                  <Tooltip title="Neutral">
                    <SentimentNeutralIcon 
                      color={attitude === "neutral" ? "primary" : "inherit"} 
                    />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="hostile" aria-label="hostile attitude">
                  <Tooltip title="Hostile">
                    <SentimentVeryDissatisfiedIcon 
                      color={attitude === "hostile" ? "error" : "inherit"} 
                    />
                  </Tooltip>
                </ToggleButton>
              </AttitudeToggleGroup>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: "space-between", padding: (theme) => theme.spacing(0, 1, 1) }}>
            <Box>
              <Tooltip title="Edit NPC">
                <IconButton onClick={() => onEdit && onEdit(npc.id)} size="small">
                  <FaEdit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notes">
                <IconButton onClick={() => onNotes && onNotes(npc.id)} size="small">
                  <FaStickyNote />
                </IconButton>
              </Tooltip>
            </Box>
            <div>
              <Tooltip title="More options">
                <IconButton
                  aria-label="more options"
                  id="npc-menu-button"
                  aria-controls={open ? 'npc-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={handleClick}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id="npc-menu"
                MenuListProps={{
                  'aria-labelledby': 'npc-menu-button',
                  dense: true
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  elevation: 3,
                }}
              >
                <MenuItem onClick={() => { onEdit && onEdit(npc.id); handleClose(); }}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit NPC</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { onUnlink && onUnlink(npc.id); handleClose(); }}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Remove from Campaign</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMoveFolderOpen}>
                  <ListItemIcon>
                    <FolderIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Move to Folder</ListItemText>
                </MenuItem>
              </Menu>
            </div>
          </CardActions>
        </StyledCard>
      </Grid>
      
      <Dialog open={moveFolderDialogOpen} onClose={handleMoveFolderClose}>
        <DialogTitle>Move to Folder</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 1 }}>
          <Select
            value={selectedFolder}
            onChange={handleFolderChange}
            fullWidth
            displayEmpty
            variant="outlined"
          >
            <MenuItem value="">
              <em>None (Root)</em>
            </MenuItem>
            {folders && folders.map((folder) => (
              <MenuItem key={folder.id} value={folder.id}>
                {folder.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMoveFolderClose}>Cancel</Button>
          <Button onClick={handleMoveToFolder} variant="contained" color="primary">
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default NpcCard;
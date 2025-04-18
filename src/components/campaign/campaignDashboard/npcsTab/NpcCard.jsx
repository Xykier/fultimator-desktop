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
  Button,
  Divider
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { FaEdit, FaStickyNote } from "react-icons/fa";
import NpcPretty from "../../../npc/Pretty";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { LinkOff } from "@mui/icons-material";

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
  width: "100%",
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
      handleClose();
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
            />
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
                
                <Box sx={{ p: 0 }}>
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
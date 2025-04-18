import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import { 
  MoreVert as MoreVertIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  FolderOpen as FolderOpenIcon,
} from "@mui/icons-material";

const NpcFolderHeader = ({ 
  selectedFolder, 
  onRenameFolder, 
  onDeleteFolder 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    onRenameFolder(selectedFolder.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteFolder(selectedFolder.id);
    handleMenuClose();
  };

  // No folder selected, don't render anything
  if (!selectedFolder) {
    return null;
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        backgroundColor: theme => theme.palette.background.paper,
        borderLeft: theme => `4px solid ${theme.palette.primary.main}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <FolderOpenIcon 
          color="primary" 
          sx={{ mr: 1.5 }} 
        />
        <Typography variant="h3" component="h2">
          {selectedFolder.name}
        </Typography>
      </Box>
      
      <IconButton 
        aria-label="folder options" 
        aria-controls="folder-menu" 
        aria-haspopup="true"
        onClick={handleMenuOpen}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      
      <Menu
        id="folder-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 180,
            overflow: 'visible',
            mt: 1.5,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleRename}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Folder</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete Folder</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default NpcFolderHeader;
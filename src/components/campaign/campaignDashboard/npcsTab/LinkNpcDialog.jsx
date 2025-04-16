import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Grid,
  Card,
  Avatar,
  Chip,
  ListItemAvatar,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

const LinkNpcDialog = ({
  open,
  handleClose,
  searchText,
  setSearchText,
  filteredNpcs,
  associatedNpcIds,
  handleToggleNpc,
}) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Link NPCs to Campaign</Typography>
          <TextField
            placeholder="Search NPCs..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: "50%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchText("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {filteredNpcs.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {searchText
                ? `No NPCs found matching "${searchText}"`
                : "No NPCs available"}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredNpcs.map((npc) => (
              <Grid item xs={12} sm={6} key={npc.id}>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1,
                    backgroundColor: associatedNpcIds.includes(npc.id)
                      ? "rgba(25, 118, 210, 0.08)"
                      : "transparent",
                    border: associatedNpcIds.includes(npc.id)
                      ? "1px solid rgba(25, 118, 210, 0.5)"
                      : "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={npc.name}
                      src={npc.avatar || ""}
                      sx={{
                        bgcolor: npc.avatar ? "transparent" : "primary.main",
                      }}
                    >
                      {!npc.avatar && npc.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <Typography variant="subtitle1">{npc.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {`Level ${npc.lvl} ${npc.species}`}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      associatedNpcIds.includes(npc.id) ? "Linked" : "Link"
                    }
                    color={
                      associatedNpcIds.includes(npc.id) ? "primary" : "default"
                    }
                    onClick={() => handleToggleNpc(npc.id)}
                    clickable
                    variant={
                      associatedNpcIds.includes(npc.id) ? "filled" : "outlined"
                    }
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkNpcDialog;

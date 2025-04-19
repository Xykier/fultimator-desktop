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
  Tooltip,
  useTheme,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import PropTypes from "prop-types";
import { getSpeciesIcon, getRankIcon } from "../../../../libs/npcIcons";
import ShieldIcon from "@mui/icons-material/Shield";
import { styled } from "@mui/material/styles";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const LinkNpcDialog = ({
  open,
  handleClose,
  searchText,
  setSearchText,
  filteredNpcs,
  associatedNpcIds,
  handleToggleNpc,
}) => {
  const theme = useTheme();
  const ICON_SIZE = 16; // Set all icons to be 16px

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
          <Typography variant="h3">Link NPCs to Campaign</Typography>
          <TextField
            placeholder="Search NPCs..."
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: "50%", ml: 2 }}
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
                      src={npc.imgurl || ""}
                      sx={{
                        bgcolor: npc.imgurl ? "transparent" : "primary.main",
                      }}
                    >
                      {!npc.imgurl && npc.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flexGrow: 1, mr: 2 }}>
                    <Typography variant="subtitle1">{npc.name}</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
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
                      <Tooltip title={npc.species}>
                        <StyledIcon>
                          {React.createElement(getSpeciesIcon(npc.species), {})}
                        </StyledIcon>
                      </Tooltip>
                      <Tooltip title={npc.rank || "soldier"}>
                        <StyledIcon sx={{ color: getRankIcon(npc.rank).color }}>
                          {getRankIcon(npc.rank).icon ? (
                            React.createElement(getRankIcon(npc.rank).icon, {})
                          ) : (
                            <ShieldIcon />
                          )}
                        </StyledIcon>
                      </Tooltip>
                      {npc.villain && (
                        <Tooltip title={`Villain: ${npc.villain}`}>
                          <StyledIcon sx={{ color: "error.main" }}>
                            <ReportProblemIcon />
                          </StyledIcon>
                        </Tooltip>
                      )}
                    </Box>
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

LinkNpcDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
  filteredNpcs: PropTypes.array.isRequired,
  associatedNpcIds: PropTypes.array.isRequired,
  handleToggleNpc: PropTypes.func.isRequired,
};

export default LinkNpcDialog;

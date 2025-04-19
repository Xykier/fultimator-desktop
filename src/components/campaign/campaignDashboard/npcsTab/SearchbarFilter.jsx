import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Button,
  Collapse,
  Typography,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  People as PeopleIcon,
  EmojiEvents as VillainIcon,
  SentimentSatisfiedAlt as FriendlyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as HostileIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

const SearchbarFilter = ({
  searchText,
  setSearchText,
  sortOrder,
  handleSortChange,
  filterType,
  handleFilterChange,
  npcRank,
  handleRankChange,
  npcSpecies,
  handleSpeciesChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSortDirectionChange = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    // Assuming you want to pass both sortOrder and sortDirection to parent component
    handleSortChange(sortOrder, newDirection);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleVillainToggle = (event) => {
    handleFilterChange(null, event.target.checked ? "villains" : "all");
  };

  // Map attitude values to icons for the select menu
  const attitudeOptions = [
    { value: "all", label: "All NPCs", icon: <PeopleIcon fontSize="small" /> },
    {
      value: "friendly",
      label: "Friendly",
      icon: <FriendlyIcon fontSize="small" />,
    },
    {
      value: "neutral",
      label: "Neutral",
      icon: <NeutralIcon fontSize="small" />,
    },
    {
      value: "hostile",
      label: "Hostile",
      icon: <HostileIcon fontSize="small" />,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
      {/* Always visible search row with expand/collapse button */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}
      >
        <TextField
          label="Search campaign NPCs..."
          placeholder="Name"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchText ? (
              <IconButton
                aria-label="clear"
                onClick={() => setSearchText("")}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            ) : null,
          }}
        />

        <Button
          onClick={toggleExpanded}
          startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ minWidth: "auto", whiteSpace: "nowrap" }}
          size="small"
        >
          {expanded ? "Hide Filters" : "More Filters"}
        </Button>
        <Tooltip title="Clear all filters">
          <Button
            onClick={() => {
              setSearchText("");
              handleSortChange("name", "asc");
              handleFilterChange(null, "all");
              handleRankChange("");
              handleSpeciesChange("");
            }}
            sx={{ minWidth: "auto", whiteSpace: "nowrap" }}
            size="small"
          >
            <DeleteSweepIcon />
          </Button>
        </Tooltip>
      </Box>

      {/* Expandable filters section */}
      <Collapse in={expanded} timeout="auto">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            width: "100%",
            p: 2,
            borderRadius: 1,
            bgcolor: theme.palette.background.paper,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ width: "100%", mb: 1 }}>
            Advanced Filters
          </Typography>

          {/* Sort controls - separate dropdown and direction button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <FormControl size="small" sx={{ minWidth: "120px", flexGrow: 1 }}>
              <InputLabel id="sort-order-label">Sort By</InputLabel>
              <Select
                labelId="sort-order-label"
                value={sortOrder}
                label="Sort By"
                onChange={(e) =>
                  handleSortChange(e.target.value, sortDirection)
                }
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="level">Level</MenuItem>
                <MenuItem value="species">Species</MenuItem>
                <MenuItem value="createdAt">Creation Date</MenuItem>
                <MenuItem value="updatedAt">Updated Date</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              onClick={handleSortDirectionChange}
              color="primary"
              size="small"
              sx={{
                border: 1,
                borderColor: "divider",
                p: 1,
              }}
            >
              {sortDirection === "asc" ? (
                <ArrowUpwardIcon fontSize="small" />
              ) : (
                <ArrowDownwardIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          {/* Attitude filter as a select dropdown */}
          <FormControl
            size="small"
            sx={{ minWidth: isMobile ? "100%" : "150px", flexGrow: 1 }}
          >
            <InputLabel id="attitude-label">Attitude</InputLabel>
            <Select
              labelId="attitude-label"
              id="attitude"
              value={filterType === "villains" ? "all" : filterType}
              label="Attitude"
              onChange={(e) => handleFilterChange(null, e.target.value)}
              renderValue={(selected) => {
                const option = attitudeOptions.find(
                  (opt) => opt.value === selected
                );
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {option?.icon}
                    <span>{option?.label}</span>
                  </Box>
                );
              }}
            >
              {attitudeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {option.icon}
                    <span>{option.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Villains as a toggle switch */}
          <FormControlLabel
            control={
              <Switch
                checked={filterType === "villains"}
                onChange={handleVillainToggle}
                color="warning"
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <VillainIcon
                  fontSize="small"
                  color={filterType === "villains" ? "warning" : "action"}
                />
                <span>Villains only</span>
              </Box>
            }
            sx={{ ml: 0 }}
          />
          <FormControl
            size="small"
            sx={{ minWidth: isMobile ? "100%" : "150px", flexGrow: 1 }}
          >
            <InputLabel id="rank-label">Rank</InputLabel>
            <Select
              labelId="rank-label"
              id="rank"
              value={npcRank}
              label="Rank"
              onChange={handleRankChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="soldier">Soldier</MenuItem>
              <MenuItem value="elite">Elite</MenuItem>
              <MenuItem value="champion1">Champion (1)</MenuItem>
              <MenuItem value="champion2">Champion (2)</MenuItem>
              <MenuItem value="champion3">Champion (3)</MenuItem>
              <MenuItem value="champion4">Champion (4)</MenuItem>
              <MenuItem value="champion5">Champion (5)</MenuItem>
              <MenuItem value="champion6">Champion (6)</MenuItem>
              <MenuItem value="companion">Companion</MenuItem>
              <MenuItem value="groupvehicle">Group Vehicle</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: isMobile ? "100%" : "150px", flexGrow: 1 }}
          >
            <InputLabel id="species-label">Species</InputLabel>
            <Select
              labelId="species-label"
              id="species"
              value={npcSpecies}
              label="Species"
              onChange={handleSpeciesChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Beast">Beast</MenuItem>
              <MenuItem value="Construct">Construct</MenuItem>
              <MenuItem value="Demon">Demon</MenuItem>
              <MenuItem value="Elemental">Elemental</MenuItem>
              <MenuItem value="Humanoid">Humanoid</MenuItem>
              <MenuItem value="Monster">Monster</MenuItem>
              <MenuItem value="Plant">Plant</MenuItem>
              <MenuItem value="Undead">Undead</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Collapse>
    </Box>
  );
};

export default SearchbarFilter;

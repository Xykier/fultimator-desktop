import React from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Badge,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Tag as TagIcon,
} from "@mui/icons-material";
import { WorldIcon } from "../../icons";

// Sorting options
const sortOptions = [
  { value: "nameAsc", label: "Name (A-Z)" },
  { value: "nameDesc", label: "Name (Z-A)" },
  { value: "recent", label: "Recently Played" },
  { value: "created", label: "Date Created" },
];

const CampaignHeader = ({
  hasCampaigns,
  searchTerm,
  sortBy,
  showFilters,
  uniqueTags,
  activeTags,
  onCreateClick,
  onSearchChange,
  onSortChange,
  onClearSearch,
  onToggleFilters,
  onTagFilter,
  onClearFilters,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          background: theme.palette.background.paper,
        }}
      >
        {/* Header section */}
        <Box
          sx={{
            background: `linear-gradient(to right, ${primary}, ${primary}, ${secondary})`,
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", color: "#ffffff" }}>
            <IconButton sx={{ px: 0.5, color: "#ffffff", cursor: "default" }}>
              <WorldIcon color="#ffffff" />
            </IconButton>
            <Typography variant="h2" sx={{ textTransform: "uppercase", ml: 1 }}>
              Your Campaigns
            </Typography>
          </Box>

          {hasCampaigns && !isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateClick}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 2,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              New Campaign
            </Button>
          )}
        </Box>

        {/* Search and Filter Controls */}
        {hasCampaigns && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              variant="outlined"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={onClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                width: { xs: "100%", sm: "auto" },
                minWidth: { sm: 180 },
              }}
            >
              <FormControl
                size={isMobile ? "small" : "medium"}
                sx={{ width: "100%" }}
              >
                <InputLabel id="sort-select-label">Sort</InputLabel>
                <Select
                  labelId="sort-select-label"
                  value={sortBy}
                  label="Sort"
                  onChange={(e) => onSortChange(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <SortIcon />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {showFilters && uniqueTags.length > 0 && (
                <Tooltip title="Filter by tags">
                  <Badge
                    badgeContent={activeTags.length}
                    color="primary"
                    overlap="circular"
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <IconButton
                      onClick={onToggleFilters}
                      color={activeTags.length > 0 ? "primary" : "default"}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        height: isMobile ? "40px" : "56px",
                        width: isMobile ? "40px" : "56px",
                      }}
                    >
                      <FilterIcon />
                    </IconButton>
                  </Badge>
                </Tooltip>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Tags filter */}
      {showFilters && uniqueTags.length > 0 && (
        <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              pr: 1,
              color: "text.secondary",
            }}
          >
            <TagIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" fontWeight="medium">
              Tags:
            </Typography>
          </Box>

          {uniqueTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              color={activeTags.includes(tag) ? "primary" : "default"}
              onClick={() => onTagFilter(tag)}
              variant={activeTags.includes(tag) ? "filled" : "outlined"}
              sx={{ borderRadius: 1 }}
            />
          ))}

          {activeTags.length > 0 && (
            <Button
              size="small"
              onClick={onClearFilters}
              variant="text"
              sx={{ ml: 1 }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

export default CampaignHeader;

import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  People as PeopleIcon,
  EmojiEvents as VillainIcon,
  SentimentSatisfiedAlt as FriendlyIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as HostileIcon
} from '@mui/icons-material';


const SearchbarFilter = ({
  searchText,
  setSearchText,
  sortOrder,
  handleSortChange,
  filterType,
  handleFilterChange
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filter type configurations with Material UI icons
  const filterTypes = [
    { value: 'all', label: 'All', icon: <PeopleIcon fontSize="small" /> },
    { value: 'friendly', label: 'Friendly', icon: <FriendlyIcon fontSize="small" /> },
    { value: 'neutral', label: 'Neutral', icon: <NeutralIcon fontSize="small" /> },
    { value: 'hostile', label: 'Hostile', icon: <HostileIcon fontSize="small" /> },
    { value: 'villains', label: 'Villains', icon: <VillainIcon fontSize="small" /> }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      {/* Search & Sort Row */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%'
      }}>
        <TextField
          placeholder="Search campaign NPCs..."
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchText && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => setSearchText("")}
                  aria-label="Clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
          <InputLabel id="sort-order-label">Sort By</InputLabel>
          <Select
            labelId="sort-order-label"
            value={sortOrder}
            label="Sort By"
            onChange={(e) => handleSortChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SortIcon fontSize="small" color="action" />
              </InputAdornment>
            }
          >
            <MenuItem value="name">Name (A-Z)</MenuItem>
            <MenuItem value="level">Level (Low-High)</MenuItem>
            <MenuItem value="species">Species</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Filter Type Row */}
      <Box>
       
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
        }}>
          {filterTypes.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              icon={filter.icon}
              onClick={() => handleFilterChange(null, filter.value)}
              color={filterType === filter.value ? "primary" : "default"}
              variant={filterType === filter.value ? "filled" : "outlined"}
              sx={{
                fontWeight: filterType === filter.value ? 500 : 400,
                minWidth: isSmallScreen ? '31%' : 'auto',
                flex: isMobile ? '1 0 auto' : 'initial',
                justifyContent: 'flex-start'
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SearchbarFilter;
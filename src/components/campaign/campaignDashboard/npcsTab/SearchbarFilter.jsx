import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const SearchbarFilter = ({ 
  searchText, 
  setSearchText, 
  sortOrder, 
  handleSortChange,
  filterType,
  handleFilterChange
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
      <TextField
        placeholder="Search campaign NPCs..."
        size="small"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ flexGrow: 1 }}
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

      <Tooltip title="Sort NPCs">
        <TextField
          select
          size="small"
          value={sortOrder}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <MenuItem value="name">Name (A-Z)</MenuItem>
          <MenuItem value="level">Level (Low-High)</MenuItem>
          <MenuItem value="species">Species</MenuItem>
        </TextField>
      </Tooltip>

      <Tabs
        value={filterType}
        onChange={handleFilterChange}
        aria-label="NPC filters"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="All" value="all" />
        <Tab label="Friendly" value="friendly" />
        <Tab label="Hostile" value="hostile" />
        <Tab label="Neutral" value="neutral" />
        <Tab label="Villains" value="villains" />
      </Tabs>
    </Box>
  );
};

export default SearchbarFilter;
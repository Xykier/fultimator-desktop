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
  SortByAlpha as SortIcon,
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
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <TextField
        placeholder="Search campaign NPCs..."
        size="small"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ flexGrow: 1, mr: 2 }}
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
        <Box sx={{ position: 'relative' }}>
          <IconButton
            size="small"
            onClick={() => {
              const menu = document.getElementById('sort-menu');
              menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }}
          >
            <SortIcon />
          </IconButton>
          <Box
            id="sort-menu"
            sx={{
              position: 'absolute',
              right: 0,
              zIndex: 1,
              mt: 1,
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 3,
              display: 'none',
            }}
          >
            <MenuItem
              onClick={() => handleSortChange('name')}
              selected={sortOrder === 'name'}
            >
              Name (A-Z)
            </MenuItem>
            <MenuItem
              onClick={() => handleSortChange('level')}
              selected={sortOrder === 'level'}
            >
              Level (Low-High)
            </MenuItem>
            <MenuItem
              onClick={() => handleSortChange('species')}
              selected={sortOrder === 'species'}
            >
              Species
            </MenuItem>
          </Box>
        </Box>
      </Tooltip>

      <Tabs
        value={filterType}
        onChange={handleFilterChange}
        aria-label="NPC filters"
        sx={{ ml: 2 }}
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
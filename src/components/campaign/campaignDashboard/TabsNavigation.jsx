import React from "react";
import { 
  Tabs, 
  Tab, 
  Paper, 
  useMediaQuery, 
  useTheme, 
  Box, 
  alpha 
} from "@mui/material";
import {
  Campaign as CampaignIcon,
  CalendarMonth as CalendarIcon,
  Diversity3 as CharactersIcon,
  Note as NoteIcon,
  LocationOn as LocationIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { GiGooeyDaemon as NpcsIcon } from "react-icons/gi";

const TabsNavigation = ({ activeTab, onTabChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Paper 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.7) : theme.palette.background.paper,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${isDarkMode ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.1)}`,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }} 
      elevation={isDarkMode ? 4 : 3}
    >
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        allowScrollButtonsMobile
        TabIndicatorProps={{
          style: {
            backgroundColor: isDarkMode 
              ? theme.palette.secondary.main 
              : theme.palette.primary.main,
            height: 3,
          }
        }}
        sx={{
          '& .MuiTabs-scroller': {
            overflow: 'visible !important',
          },
          '& .MuiTabs-flexContainer': {
            gap: { xs: 0, md: 1 }
          },
          '& .MuiButtonBase-root': {
            minHeight: { xs: '48px', md: '56px' },
            transition: 'all 0.2s ease-in-out',
            fontWeight: 500,
            opacity: 0.7,
            color: isDarkMode 
              ? theme.palette.common.white
              : theme.palette.text.primary,
            '&:hover': {
              opacity: 0.9,
              backgroundColor: isDarkMode
                ? alpha(theme.palette.action.hover, 0.1)
                : alpha(theme.palette.action.hover, 0.05),
              color: isDarkMode
                ? theme.palette.secondary.main
                : theme.palette.primary.main,
            },
            '&.Mui-selected': {
              opacity: 1,
              fontWeight: 600,
              color: isDarkMode
                ? theme.palette.secondary.main
                : theme.palette.primary.main,
            }
          },
          '& .MuiSvgIcon-root, & .MuiBox-root': {
            transition: 'transform 0.2s ease-in-out',
            mb: 0.5,
          },
          '& .Mui-selected .MuiSvgIcon-root, & .Mui-selected .MuiBox-root': {
            transform: 'scale(1.1)',
            color: isDarkMode
              ? theme.palette.secondary.main
              : theme.palette.primary.main,
          },
        }}
      >
        <Tab 
          icon={<CampaignIcon />} 
          label="Overview" 
          value='overview'
          sx={{ 
            borderRadius: { xs: 0, md: '4px 4px 0 0' } 
          }}
        />
        <Tab 
          icon={<CalendarIcon />} 
          label="Sessions" 
          value='sessions'
          sx={{ 
            borderRadius: { xs: 0, md: '4px 4px 0 0' } 
          }}
        />
        <Tab 
          icon={<CharactersIcon />} 
          label="Characters" 
          value='characters'
          sx={{ 
            borderRadius: { xs: 0, md: '4px 4px 0 0' } 
          }}
        />
        <Tab
          icon={
            <Box sx={{ 
              fontSize: 24, 
              display: "flex", 
              alignItems: "center",
              color: 'inherit'
            }}>
              <NpcsIcon />
            </Box>
          }
          label="NPCs"
          value='npcs'
          sx={{ 
            borderRadius: { xs: 0, md: '4px 4px 0 0' } 
          }}
        />
        <Tab 
          icon={<NoteIcon />} 
          label="Notes" 
          value='notes'
          sx={{ 
            borderRadius: { xs: 0, md: '4px 4px 0 0' } 
          }}
        />
        <Tab 
          icon={<LocationIcon />} 
          label="Locations" 
          value='locations'
          sx={{ 
            borderRadius: { xs: 0, md: '4px 4px 0 0' } 
          }}
        />
        <Tab 
          icon={<MapIcon />} 
          label="Map" 
          value='map'
          sx={{ 
            borderRadius: { xs: 0, md: '4px 4px 0 0' } 
          }}
        />
      </Tabs>
    </Paper>
  );
};

export default TabsNavigation;
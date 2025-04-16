import React from "react";
import { Tabs, Tab, Paper, useMediaQuery, useTheme, Box } from "@mui/material";
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

  return (
    <Paper sx={{ mb: 3, borderRadius: 2 }} elevation={3}>
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab icon={<CampaignIcon />} label="Overview" />
        <Tab icon={<CalendarIcon />} label="Sessions" />
        <Tab icon={<CharactersIcon />} label="Characters" />
        <Tab
          icon={
            <Box sx={{ fontSize: 24, display: "flex", alignItems: "center" }}>
              <NpcsIcon />
            </Box>
          }
          label="NPCs"
        />
        <Tab icon={<NoteIcon />} label="Notes" />
        <Tab icon={<LocationIcon />} label="Locations" />
        <Tab icon={<MapIcon />} label="Map" />
      </Tabs>
    </Paper>
  );
};

export default TabsNavigation;

import { Container } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "./appbar/AppBar";
import CompactAppBar from "./appbar/CompactAppBar";
import { useThemeContext } from "../ThemeContext";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Midnight";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean; // New prop for controlling Container width
  unsavedChanges?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth, unsavedChanges }) => {
  const { setTheme } = useThemeContext();
  const [selectedTheme, setSelectedTheme] = useState<ThemeValue>(() => {
    return (localStorage.getItem("selectedTheme") as ThemeValue) || "Fabula";
  });

  const handleSelectTheme = (theme: ThemeValue) => {
    setSelectedTheme(theme);
  };

  useEffect(() => {
    // Update the theme in localStorage and ThemeContext
    localStorage.setItem("selectedTheme", selectedTheme);
    setTheme(selectedTheme);
  }, [selectedTheme, setTheme]);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = async () => {
    if (unsavedChanges) {
      // Determine if Electron API is available
      const confirm = window.electron 
        ? window.electron.confirm 
        : (message: string) => Promise.resolve(window.confirm(message));
      
      // Prompt for unsaved changes
      const confirmation = await confirm("You have unsaved changes. Are you sure you want to leave?");
      
      if (!confirmation) {
        return; // Do not navigate if the user cancels
      }
    }
    
    navigate(-1); // Proceed with navigation if the user confirms
  };

  const npcRoutes = ["/npc-gallery/:npcId"];
  const isNpcEdit = npcRoutes.some(route =>
    new RegExp(route.replace(/:\w+/, "\\w+")).test(location.pathname)
  );

  const pcRoutes = ["/pc-gallery/:playerId", "/character-sheet/:playerId"];
  const isPcEdit = pcRoutes.some(route =>
    new RegExp(route.replace(/:\w+/, "\\w+")).test(location.pathname)
  );

  // Determine if the current path is the homepage
  const isHomepage = location.pathname === "/";

  return (
    <>
      {isNpcEdit || isPcEdit ? (
        <CompactAppBar
          isNpcEdit={isNpcEdit}
          isPcEdit={isPcEdit}
          selectedTheme={selectedTheme}
          handleSelectTheme={handleSelectTheme}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
        />
      ) : (
        <AppBar
          isNpcEdit={isNpcEdit}
          selectedTheme={selectedTheme}
          handleSelectTheme={handleSelectTheme}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
        />
      )}
      {fullWidth ? (
        <div style={{ marginTop: "5em" }}>{children}</div>
      ) : (
        <Container style={{ marginTop: "6em", alignItems: "center" }}>
          {children}
        </Container>
      )}
    </>
  );
};

export default Layout;

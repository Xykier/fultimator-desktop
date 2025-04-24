// src/App.jsx
import React, { Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useThemeContext } from "./ThemeContext";
import { lightFabula, darkFabula } from "./themes/Fabula";
import { lightHigh, darkHigh } from "./themes/High";
import { lightTechno, darkTechno } from "./themes/Techno";
import { lightNatural, darkNatural } from "./themes/Natural";
import { lightBravely, darkBravely } from "./themes/Bravely";
import { lightObscura, darkObscura } from "./themes/Obscura";
import ErrorBoundary from "./ErrorBoundary";

import Home from "./routes/Home";
/*
import Generator from './routes/generator/generator';
import NpcGallery from './routes/npc-gallery/npc-gallery';
import NpcEdit from './routes/npc-edit/npc-edit';
import CombatSimulatorEncounters from './routes/combat/combatSimulatorEncounters';
import CharacterSheet from './routes/character-sheet/character-sheet';
import PlayerGallery from './routes/player-gallery/player-gallery';
import PlayerEdit from './routes/player-edit/player-edit';
import CombatSimulator from './routes/combat/combatSimulator';
*/

import LoadingPage from "./components/common/LoadingPage";

const NpcGallery = React.lazy(() => import("./routes/npc-gallery/npc-gallery"));
const NpcEdit = React.lazy(() => import("./routes/npc-edit/npc-edit"));
const PlayerEdit = React.lazy(() => import("./routes/player-edit/player-edit"));
const PlayerGallery = React.lazy(() =>
  import("./routes/player-gallery/player-gallery")
);
const CharacterSheet = React.lazy(() =>
  import("./routes/character-sheet/character-sheet")
);
const CombatSimulator = React.lazy(() =>
  import("./routes/combat/combatSimulator")
);
const CombatSimulatorEncounters = React.lazy(() =>
  import("./routes/combat/combatSimulatorEncounters")
);
const Generator = React.lazy(() => import("./routes/generator/generator"));
const CampaignList = React.lazy(() => import("./routes/campaign/campaignList"));
const CampaignDashboard = React.lazy(() => import("./routes/campaign/campaignDashboard"));

const themes = {
  Fabula: { light: lightFabula, dark: darkFabula },
  High: { light: lightHigh, dark: darkHigh },
  Techno: { light: lightTechno, dark: darkTechno },
  Natural: { light: lightNatural, dark: darkNatural },
  Bravely: { light: lightBravely, dark: darkBravely },
  Obscura: { light: lightObscura, dark: darkObscura },
};

const App = () => {
  const { selectedTheme, isDarkMode } = useThemeContext();
  const currentTheme = themes[selectedTheme]
    ? isDarkMode
      ? themes[selectedTheme].dark
      : themes[selectedTheme].light
    : themes.Fabula.light;

  return (
    <React.StrictMode>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <HashRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/pc-gallery/:playerId"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <PlayerEdit />
                  </Suspense>
                }
              />
              <Route
                path="/pc-gallery"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <PlayerGallery />
                  </Suspense>
                }
              />
              <Route
                path="/npc-gallery/:npcId"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <NpcEdit />
                  </Suspense>
                }
              />
              <Route
                path="/npc-gallery"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <NpcGallery />
                  </Suspense>
                }
              />
              <Route
                path="/generate"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <Generator />
                  </Suspense>
                }
              />
              <Route
                path="/combat-sim"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CombatSimulatorEncounters />
                  </Suspense>
                }
              />
              <Route
                path="/combat-sim/:id"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CombatSimulator />
                  </Suspense>
                }
              />
              <Route
                path="/character-sheet/:playerId"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CharacterSheet />
                  </Suspense>
                }
              />
              <Route
                path="/campaigns"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CampaignList />
                  </Suspense>
                }
              />
              <Route
                path="/campaign/:campaignId/*"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CampaignDashboard />
                  </Suspense>
                }
              />
            </Routes>
          </ErrorBoundary>
        </HashRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;

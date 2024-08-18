import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import Home from "./routes/Home";
import Generator from "./routes/generator/generator";
import NpcGallery from "./routes/npc-gallery/npc-gallery";
import NpcEdit from "./routes/npc-edit/npc-edit";
import Combat from "./routes/combat/combat";
import CharacterSheet from "./routes/character-sheet/character-sheet";
import Fabula from "./themes/Fabula";
import High from "./themes/High";
import Techno from "./themes/Techno";
import Natural from "./themes/Natural";
import Midnight from "./themes/Midnight";
import {
  ThemeProvider as AppThemeProvider,
  useThemeContext,
} from "./ThemeContext";
import PlayerGallery from "./routes/player-gallery/player-gallery";
import PlayerEdit from "./routes/player-edit/player-edit";
import ErrorBoundary from "./ErrorBoundary";

const themes = {
  Fabula,
  High,
  Techno,
  Natural,
  Midnight,
};

const App = () => {
  const { selectedTheme } = useThemeContext();

  return (
    <React.StrictMode>
      <ThemeProvider theme={themes[selectedTheme]}>
        <CssBaseline />
        <HashRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pc-gallery/:playerId" element={<PlayerEdit />} />
              <Route path="/pc-gallery" element={<PlayerGallery />} />
              <Route path="/npc-gallery/:npcId" element={<NpcEdit />} />
              <Route path="/npc-gallery" element={<NpcGallery />} />
              <Route path="/generate" element={<Generator />} />
              <Route path="/combat" element={<Combat />} />
              <Route
                path="/character-sheet/:playerId"
                element={<CharacterSheet />}
              />
            </Routes>
          </ErrorBoundary>
        </HashRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const Root = () => (
  <AppThemeProvider>
    <App />
  </AppThemeProvider>
);

const root = document.getElementById("root");
const rootElement = ReactDOM.createRoot(root);
rootElement.render(<Root />);

reportWebVitals();

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Help,
  FileDownload,
  FileUpload,
  Info,
  Login,
  Logout,
  CloudUpload,
  CloudDownload,
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";
import DarkModeToggle, { DarkModeToggleProps } from "./DarkModeToggle";
import ThemeSwitcher, { ThemeSwitcherProps } from "./ThemeSwitcher";
import LanguageMenu from "./LanguageMenu";
import HelpFeedbackDialog from "./HelpFeedbackDialog"; // Import the dialog component
import {
  exportDatabase,
  importDatabase,
  handleExport,
  handleImport,
} from "../../utility/dbExportImport"; // Import the new functions
import { useLocation } from "react-router-dom";

interface MenuOptionProps extends ThemeSwitcherProps, DarkModeToggleProps {}

const MenuOption: React.FC<MenuOptionProps> = ({
  selectedTheme,
  onSelectTheme,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
  const [isImportWarningOpen, setIsImportWarningOpen] = useState(false); // State for import warning dialog
  const [importType, setImportType] = useState<"local" | "google" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [version, setVersion] = useState<string>("");
  const location = useLocation(); // Get the current route

  useEffect(() => {
    const fetchVersion = async () => {
      if (window.electron) {
        const appVersion = await window.electron.getVersion();
        setVersion(appVersion);
      }
    };

    fetchVersion();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await window.electron.checkAuth();
      setIsAuthenticated(response.isAuthenticated);
    };

    checkAuth();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    handleClose();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await window.electron.loginWithGoogle();
      setIsAuthenticated(true);
      setMessage("Logged in successfully!");
    } catch (error) {
      setIsAuthenticated(false);
      const errorMessage =
        typeof error === "string"
          ? error
          : (error as Error).message || t("An unknown error occurred") || ".";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSnackbarOpen(true);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await window.electron.logoutGoogle();
      setIsAuthenticated(false);
      setMessage("Logged out successfully!");
    } catch (error) {
      setMessage("Failed to log out.");
    } finally {
      setIsLoading(false);
      setIsSnackbarOpen(true);
    }
  };

  const handleGoogleExport = async () => {
    setIsLoading(true);
    try {
      await handleExport();
      setMessage("Database exported and uploaded successfully!");
    } catch (error) {
      console.error("Export to Google Drive failed:", error);
      setMessage("Failed to export and upload database.");
    } finally {
      setIsLoading(false);
      setIsSnackbarOpen(true);
    }
  };

  const handleLocalExport = async () => {
    try {
      await exportDatabase();
      setMessage("Database exported successfully!");
      setIsSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      setMessage("Failed to export database.");
      setIsSnackbarOpen(true);
    }
  };

  const handleGoogleImport = () => {
    setImportType("google"); // Set the import type to Google
    setIsImportWarningOpen(true); // Open the warning dialog
  };

  const handleLocalImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      try {
        await importDatabase(event.target.files[0]);
        setMessage("Database imported successfully!");
        setIsSnackbarOpen(true);
      } catch (error) {
        console.error(error);
        setMessage("Failed to import database.");
        setIsSnackbarOpen(true);
      }
    }
  };

  const handleImportClick = () => {
    setImportType("local"); // Set the import type to Local
    setIsImportWarningOpen(true); // Open the warning dialog
  };

  const handleImportConfirm = async () => {
    // Start import process
    if (importType === "google") {
      setIsImportWarningOpen(false);
      // Start Google import process
      await handleGoogleImportProcess();
    } else if (importType === "local") {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      setIsImportWarningOpen(false);

      // Wait for the file import to finish before checking the route
      await new Promise<void>((resolve) => {
        // Wait until the file is imported
        const handleFileImport = async (file) => {
          try {
            await importDatabase(file);
            setMessage("Database imported successfully!");
            setIsSnackbarOpen(true);
            resolve(); // Resolve the promise once the import is done
          } catch (error) {
            console.error(error);
            setMessage("Failed to import database.");
            setIsSnackbarOpen(true);
            resolve(); // Resolve the promise even if the import fails
          }
        };

        // Attach event listener to handle file import after file selection
        fileInputRef.current?.addEventListener("change", (event) => {
          const input = event.target as HTMLInputElement; // Cast event.target to HTMLInputElement
          if (input.files && input.files[0]) {
            handleFileImport(input.files[0]);
          }
        });
      });
    }

    // After the import process, check if we are on a specific route and reload
    if (
      location.pathname === "/npc-gallery" ||
      location.pathname === "/pc-gallery" ||
      location.pathname === "/combat-sim"
    ) {
      window.location.reload();
    }
  };

  const handleImportCancel = () => {
    setIsImportWarningOpen(false);
  };

  const handleGoogleImportProcess = async () => {
    setIsLoading(true);
    try {
      const files = await window.electron.listFiles();
      if (files.length > 0) {
        const fileId = files[0].id;
        await handleImport(fileId);
        setMessage("Database downloaded and imported successfully!");
      } else {
        setMessage("No files found in Google Drive.");
      }
    } catch (error) {
      setMessage("Failed to import database.");
    } finally {
      setIsLoading(false);
      setIsSnackbarOpen(true);
    }
  };

  return (
    <>
      <IconButton size="medium" color="inherit" onClick={handleClick}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleLocalExport} disabled={isLoading}>
          <ListItemIcon>
            <FileDownload />
          </ListItemIcon>
          <ListItemText primary={t("Export Local Database")} />
        </MenuItem>
        <MenuItem
          onClick={handleImportClick}
          disabled={
            isLoading ||
            location.pathname.startsWith("/npc-gallery/") ||
            location.pathname.startsWith("/pc-gallery/") ||
            location.pathname.startsWith("/combat-sim/")
          }
        >
          <ListItemIcon>
            <FileUpload />
          </ListItemIcon>
          <ListItemText primary={t("Import Local Database")} />
        </MenuItem>
        <Divider key="local-import-divider" />
        {isAuthenticated ? (
          <>
            <MenuItem onClick={handleLogout} disabled={isLoading}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary={t("Sign Out")} />
            </MenuItem>
            <MenuItem onClick={handleGoogleExport} disabled={isLoading}>
              <ListItemIcon>
                <CloudUpload />
              </ListItemIcon>
              <ListItemText primary={t("Export to Google Drive")} />
            </MenuItem>
            <MenuItem
              onClick={handleGoogleImport}
              disabled={
                isLoading ||
                location.pathname.startsWith("/npc-gallery/") ||
                location.pathname.startsWith("/pc-gallery/") ||
                location.pathname.startsWith("/combat-sim/")
              }
            >
              <ListItemIcon>
                <CloudDownload />
              </ListItemIcon>
              <ListItemText primary={t("Import from Google Drive")} />
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={handleGoogleAuth} disabled={isLoading}>
            <ListItemIcon>
              <Login />
            </ListItemIcon>
            <ListItemText primary={t("Sign In")} />
          </MenuItem>
        )}
        <Divider key="sign-in-out-divider" />

        <MenuItem>
          <DarkModeToggle
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </MenuItem>
        <Divider key="darkmode-switcher-divider" />

        <ThemeSwitcher
          key="theme-switcher"
          selectedTheme={selectedTheme}
          onSelectTheme={onSelectTheme}
        />
        <Divider key="theme-switcher-divider" />
        <LanguageMenu key="language-menu" />
        <Divider key="language-menu-divider" />
        <MenuItem onClick={handleDialogOpen}>
          {/* Open the dialog */}
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          <ListItemText primary={t("Help & Feedback")} />
        </MenuItem>
        {window.electron && (
          <>
            <Divider key="help-feedback-divider" />
            <MenuItem>
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText primary={t("Version") + ": " + version} />
            </MenuItem>
          </>
        )}
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleLocalImport}
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isSnackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={t(message)}
      />
      <HelpFeedbackDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        userEmail={"local"}
        userUUID={"local"}
        title={"Help & Feedback"}
        placeholder={t(
          "How can we help you today? Please leave a message in english!"
        )}
        onSuccess={() => console.log("Successfully submitted feedback")}
        webhookUrl={import.meta.env.VITE_DISCORD_FEEDBACK_WEBHOOK_URL || ""}
      />{" "}
      {/* Render the dialog */}
      <Dialog open={isImportWarningOpen} onClose={handleImportCancel}>
        <DialogTitle variant="h3">{t("Confirm Import")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {importType === "google"
              ? t(
                  "Are you sure you want to import from Google Drive? This action will replace the current database."
                )
              : t(
                  "Are you sure you want to import the local database? This action will replace the current database."
                )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleImportCancel}
            color="secondary"
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleImportConfirm}
            color="error"
          >
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MenuOption;

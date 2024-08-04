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
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Help,
  FileDownload,
  FileUpload,
  Info,
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";

import ThemeSwitcher, { ThemeSwitcherProps } from "./ThemeSwitcher";
import LanguageMenu from "./LanguageMenu";
import HelpFeedbackDialog from "./HelpFeedbackDialog"; // Import the dialog component
import {
  exportDatabase,
  importDatabase,
  handleExport,
  handleImport,
} from "../../utility/dbExportImport"; // Import the new functions

interface MenuOptionProps extends ThemeSwitcherProps {}

const MenuOption: React.FC<MenuOptionProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility
  const [isImportWarningOpen, setIsImportWarningOpen] = useState(false); // State for import warning dialog
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [version, setVersion] = useState<string>("");

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
    const checkAuthentication = async () => {
      try {
        const authenticated = await window.electron.checkAuthentication();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("Error checking authentication status", error);
      }
    };

    checkAuthentication();
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
      await window.electron.authenticateGoogle();
      setIsAuthenticated(true);
      setMessage("Authenticated with Google successfully!");
    } catch (error) {
      setMessage("Failed to authenticate with Google.");
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
      setMessage("Failed to export and upload database.");
    } finally {
      setIsLoading(false);
      setIsSnackbarOpen(true);
    }
  };

  const handleGoogleImport = async () => {
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

  const handleLocalExport = async () => {
    await exportDatabase();
    setMessage(t("Database exported successfully!"));
    setIsSnackbarOpen(true);
  };

  const handleImportClick = () => {
    setIsImportWarningOpen(true);
  };

  const handleImportConfirm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setIsImportWarningOpen(false);
  };

  const handleImportCancel = () => {
    setIsImportWarningOpen(false);
  };

  const handleLocalImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      try {
        await importDatabase(event.target.files[0]);
        setMessage(t("Database imported successfully!"));
        setIsSnackbarOpen(true);
        window.location.reload(); // Reload the page to reflect changes
      } catch (error) {
        console.error(error);
        setMessage(t("Failed to import database."));
        setIsSnackbarOpen(true);
      }
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
        <MenuItem onClick={handleLocalExport}>
          <ListItemIcon>
            <FileDownload />
          </ListItemIcon>
          <ListItemText primary={t("Export Database")} />
        </MenuItem>

        <MenuItem onClick={handleImportClick}>
          <ListItemIcon>
            <FileUpload />
          </ListItemIcon>
          <ListItemText primary={t("Import Database")} />
        </MenuItem>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleLocalImport}
        />

        {isAuthenticated ? (
          <>
            <MenuItem onClick={handleGoogleExport}>
              <ListItemIcon>
                <FileDownload />
              </ListItemIcon>
              <ListItemText primary={t("Export to Google Drive")} />
            </MenuItem>
            <MenuItem onClick={handleGoogleImport}>
              <ListItemIcon>
                <FileUpload />
              </ListItemIcon>
              <ListItemText primary={t("Import from Google Drive")} />
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText primary={t("Logout")} />
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={handleGoogleAuth}>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary={t("Authenticate with Google")} />
          </MenuItem>
        )}

        <Divider key="sign-in-out-divider" />

        <ThemeSwitcher
          key="theme-switcher"
          selectedTheme={selectedTheme}
          onSelectTheme={onSelectTheme}
        />
        <Divider key="theme-switcher-divider" />

        <LanguageMenu key="language-menu" />
        <Divider key="language-menu-divider" />

        <MenuItem onClick={handleDialogOpen}>
          {" "}
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
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isSnackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={message}
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
        webhookUrl={process.env.REACT_APP_DISCORD_FEEDBACK_WEBHOOK_URL || ""}
      />{" "}
      {/* Render the dialog */}
      <Dialog open={isImportWarningOpen} onClose={handleImportCancel}>
        <DialogTitle>{t("Import Database")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "Importing a database will delete all current saved NPCs and PCs. Do you want to continue?"
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportCancel} color="primary">
            {t("Cancel")}
          </Button>
          <Button onClick={handleImportConfirm} color="primary" autoFocus>
            {t("Yes, Import")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MenuOption;

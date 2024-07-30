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
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";

import ThemeSwitcher, { ThemeSwitcherProps } from "./ThemeSwitcher";
import LanguageMenu from "./LanguageMenu";
import HelpFeedbackDialog from "./HelpFeedbackDialog"; // Import the dialog component
import { exportDatabase, importDatabase } from "../../utility/dbExportImport"; // Import the new functions

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

  const handleExport = async () => {
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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <MenuItem onClick={handleExport}>
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
          onChange={handleImport}
        />

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

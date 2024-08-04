import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { handleExport, handleImport } from "../utility/dbExportImport";

export default function LoginExample() {
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuthentication = async () => {
      try {
        // Assuming there's a function to check if the user is authenticated
        const authenticated = await window.electron.checkAuthentication();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("Error checking authentication status", error);
      }
    };

    checkAuthentication();
  }, []);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await window.electron.authenticateGoogle();
      setIsAuthenticated(true);
      setStatusMessage("Authenticated with Google successfully!");
    } catch (error) {
      setStatusMessage("Failed to authenticate with Google.");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await window.electron.logoutGoogle();
      setIsAuthenticated(false);
      setStatusMessage("Logged out successfully!");
    } catch (error) {
      setStatusMessage("Failed to log out.");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleExportClick = async () => {
    setIsLoading(true);
    try {
      await handleExport();
      setStatusMessage("Database exported and uploaded successfully!");
    } catch (error) {
      setStatusMessage("Failed to export and upload database.");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleImportClick = async () => {
    setIsLoading(true);
    try {
      const files = await window.electron.listFiles();

      if (files.length > 0) {
        const fileId = files[0].id;
        await handleImport(fileId);
        setStatusMessage("Database downloaded and imported successfully!");
      } else {
        setStatusMessage("No files found in Google Drive.");
      }
    } catch (error) {
      setStatusMessage("Failed to import database.");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {isAuthenticated ? (
        <>
          <Button
            variant="contained"
            onClick={handleExportClick}
            disabled={isLoading}
            sx={{ m: 3 }}
          >
            Export and Upload to Google Drive
          </Button>
          <Button
            variant="contained"
            onClick={handleImportClick}
            disabled={isLoading}
            sx={{ m: 3 }}
          >
            Download and Import from Google Drive
          </Button>
          <Button
            variant="outlined"
            onClick={handleLogout}
            disabled={isLoading}
            sx={{ m: 3 }}
          >
            Logout
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          sx={{ m: 3 }}
        >
          Authenticate with Google
        </Button>
      )}

      {isLoading && (
        <CircularProgress
          style={{ display: "block", margin: "auto", marginTop: 20 }}
        />
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={statusMessage.includes("Failed") ? "error" : "success"}
        >
          {statusMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

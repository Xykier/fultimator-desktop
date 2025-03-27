// electron/google.ts
import { google } from "googleapis";
import Store from "electron-store";
import fs from "fs";
import path from "node:path";
import { app, BrowserWindow } from "electron";

const OAuth2Client = google.auth.OAuth2;
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost";
const OAuth2 = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);

const store = new Store();

// Function to start the login process
export async function loginGoogle(): Promise<any> {
  return new Promise((resolve, reject) => {
    const authUrl = OAuth2.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive.file"],
    });

    let authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      show: true,
    });

    authWindow.loadURL(authUrl);

    authWindow.webContents.on("will-redirect", async (event, url) => {
      if (url.startsWith(REDIRECT_URI)) {
        event.preventDefault();
        const code = new URL(url).searchParams.get("code");

        if (code) {
          try {
            const { tokens } = await OAuth2.getToken(code);
            OAuth2.setCredentials(tokens);
            store.set("googleTokens", tokens); // Save tokens persistently
            resolve(tokens);
          } catch (error) {
            reject(error);
          }
        }

        authWindow?.close();
      }
    });

    authWindow.on("closed", () => {
      authWindow = null;
    });
  });
}

// Function to check and refresh tokens if needed
export async function checkAuth() {
  const tokens = store.get("googleTokens");
  if (!tokens) return { isAuthenticated: false };

  OAuth2.setCredentials(tokens);

  // Check if the token is expired
  const now = new Date().getTime();
  const expiryDate = (tokens as any).expiry_date || 0;

  if (now >= expiryDate) {
    console.log("Token expired, refreshing...");
    try {
      const { credentials } = await OAuth2.refreshAccessToken();
      store.set("googleTokens", credentials);
      return { isAuthenticated: true, tokens: credentials };
    } catch (error) {
      store.delete("googleTokens");
      return { isAuthenticated: false };
    }
  }

  return { isAuthenticated: true, tokens };
}

export function logoutGoogle() {
  store.delete("googleTokens");
  return { isAuthenticated: false };
}

// Function to handle file upload to Google Drive
export async function uploadToGoogleDrive(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const tokens = store.get("googleTokens");
    OAuth2.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: OAuth2 });

    const response = await drive.files.list({
      q: "name='fultimatordb.json'",
      fields: "files(id, name)",
    });

    const existingFile = response.data.files.find(
      (file) => file.name === "fultimatordb.json"
    );

    let res;
    if (existingFile) {
      res = await drive.files.update({
        fileId: existingFile.id,
        media: {
          body: fs.createReadStream(filePath),
        },
        fields: "id",
      });
    } else {
      const fileMetadata = {
        name: "fultimatordb.json",
        mimeType: "application/json",
      };
      const media = {
        body: fs.createReadStream(filePath),
      };
      res = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });
    }

    console.log("File uploaded with ID:", res.data.id);
    return res.data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Handle download from Google Drive
export async function downloadFromGoogleDrive(fileId: string) {
  console.log("Requested file ID:", fileId); // Log file ID
  try {
    const tokens = store.get("googleTokens");
    OAuth2.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: OAuth2 });

    const res = await drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" }
    );

    const filePath = path.join(app.getPath("documents"), "fultimatordb.json");
    const dest = fs.createWriteStream(filePath);
    res.data.pipe(dest);

    return new Promise((resolve, reject) => {
      dest.on("finish", () => {
        console.log("Download completed:", filePath);
        resolve(filePath);
      });
      dest.on("error", (err) => {
        console.error("Error writing file:", err);
        reject(err);
      });
      res.data.on("error", (err) => {
        console.error("Error in response stream:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("Error downloading file", error);
    throw error;
  }
}

// Handle file list from Google Drive
export async function listGoogleDriveFiles() {
  try {
    const tokens = store.get("googleTokens");
    OAuth2.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: OAuth2 });

    const response = await drive.files.list({
      q: "name='fultimatordb.json'",
      fields: "files(id, name)",
    });

    if (response.data.files.length > 0) {
      console.log("Files found in Google Drive:", response.data.files);
      return response.data.files;
    } else {
      console.log("No fultimator db files found in Google Drive.");
      throw new Error("No files found");
    }
  } catch (error) {
    console.error("Error listing files", error);
    throw error;
  }
}

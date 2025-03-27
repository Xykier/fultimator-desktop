// electron/menus.ts
import { Menu, BrowserWindow, dialog } from "electron";
import path from "node:path";
import fs from "fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createAppMenu(mainWindow: BrowserWindow) {
  const template = [
    {
      label: "File",
      submenu: [
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            mainWindow.close();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => showAboutDialog(mainWindow),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

function showAboutDialog(mainWindow: BrowserWindow) {
  // Assume package.json is one level up from the current directory
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const version = packageJson.version;

  // Try to find a logo
  const logoPossiblePaths = [
    path.join(process.env.VITE_PUBLIC!, "logo512.png"),
    path.join(process.env.VITE_PUBLIC!, "logo192.png"),
    path.join(process.env.VITE_PUBLIC!, "logo120.png"),
  ];
  const logoPath = logoPossiblePaths.find((p) => fs.existsSync(p));

  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "About Fultimator",
    icon: logoPath || undefined,
    message: "Fultimator Desktop",
    detail: `Version: ${version}\n\n`,
    buttons: ["OK"],
  });
}

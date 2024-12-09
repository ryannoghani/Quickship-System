const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Important for security (use IPC to communicate)
      preload: path.join(__dirname, "preload.js"), // Optional, if using IPC
    },
  });

  // Load the React app from the build folder
  win.loadURL("http://localhost:3000"); // If running dev server or load the build in production
}

app.whenReady().then(() => {
  createWindow();

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
});

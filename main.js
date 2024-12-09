<<<<<<< HEAD
const ManifestGridTranslator = require("./ManifestGridTranslator");
const BalanceOperation = require("./BalanceOperation");

let testManifestGridTranslator = new ManifestGridTranslator();
let grid = testManifestGridTranslator.ConvertManifestToGrid("Manifests/ShipCase1.txt");
let testBalanceOperation = new BalanceOperation(grid);
testBalanceOperation.BalanceOperationSearch();
if(testBalanceOperation.goalState != null) {
    console.log("\nThe total cost for this balance is " + testBalanceOperation.goalState.gCost + ".\n");
    for(let i = 0; i < testBalanceOperation.operationList.length; i++) {
        console.log("Step " + (i + 1) + ": " + testBalanceOperation.operationList[i]);
    }
}
else {
    console.log("Found no solution");
}
=======
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
>>>>>>> main

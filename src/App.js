import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { MdBalance } from "react-icons/md";
import { PiCraneTowerLight } from "react-icons/pi";
import { TbFileDownload } from "react-icons/tb";
import { GiSave } from "react-icons/gi";
import ManifestView from "./components/ManifestView.js";
import LogPanel from "./components/LogPanel.js";
import StepControlBar from "./components/StepControlBar.js";
import BalanceOperation from "./functions/BalanceOperation.js";
import ManifestGridTranslator from "./functions/ManifestGridTranslator.js";

function App() {
  const fileInputRef = useRef(null);
  const [isActive, setIsActive] = useState(false); // True when file is loaded
  const [manifestFile, setManifestFile] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [mode, setMode] = useState("loadUnload"); //Used to dynamically change behavior of Start button between balance and load/unload
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [log, setLog] = useState([]);
  const [steps, setSteps] = useState([]); // Step descriptions generated in a session
  const [grids, setGrids] = useState([]); // Array of manifests to display in a session
  const [stepIndex, setStepIndex] = useState(0); // Tracks current step that is displayed
  const [completedSteps, setCompletedSteps] = useState(new Set()); // Tracks completed steps

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleLoadManifest = (event) => {
    setIsActive(true);
    if (grids.length > 0) {
      if (
        !window.confirm(
          "A session is already active. Overwrite it and start a new one? Unsaved progress will be lost."
        )
      ) {
        return;
      }
    }
    setSteps([]);
    setStepIndex(0);
    setCompletedSteps(new Set());
    const fileReader = new FileReader();
    setManifestFile(event.target.files[0]);
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      console.log("File Read Complete:", e.target.result); // Log raw file content
      const fileString = e.target.result;
      const translator = new ManifestGridTranslator();
      let grid = translator.ConvertManifestToGrid(fileString);
      setGrids([grid]); // Update the state
    };
  };

  const handleSaveManifest = () => {
    setIsActive(false);

    const saveFile = async (content) => {
      const blob = new Blob([content], { type: "text/plain" });
      const a = document.createElement("a");

      const fileExtension = manifestFile.name.slice(
        manifestFile.name.lastIndexOf(".")
      );
      a.download =
        manifestFile.name.replace(fileExtension, "") +
        "OUTBOUND" +
        fileExtension;
      a.href = URL.createObjectURL(blob);
      a.addEventListener("click", (e) => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
      });
      a.click();
    };

    let translator = new ManifestGridTranslator();
    let content = translator.ConvertGridToManifest(grids[stepIndex]);
    saveFile(content);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    const newUserLog = `${
      currentUser ? currentUser + " signs out" : ""
    } ${userName} signs in`;
    setLog((oldLog) => [...oldLog, newUserLog]);
    setCurrentUser(userName);
    setUserName(""); // Clear the input field
  };

  const handleLoadUnload = () => {
    console.log("Load/Unload action triggered");
    setMode("loadUnload");
  };

  const handleBalance = () => {
    console.log("Balance action triggered");
    setMode("balance");
  };

  const handleNextStep = () => {
    if (stepIndex < grids.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleStart = () => {
    if (mode === "balance") {
      let balanceOp = new BalanceOperation(grids[0]);
      balanceOp.BalanceOperationSearch();
      setGrids([grids[0]].concat(balanceOp.gridList));
      setSteps(balanceOp.operationList);
    }
    if (mode === "loadUnload") {
    }
  };

  return (
    <div className="App">
      <div className="TopBar">
        <div className="AppName">QuickShip</div>
        <div className="Time">{currentDateTime.toLocaleTimeString()}</div>
        <div className="Date">{currentDateTime.toLocaleDateString()}</div>
      </div>
      <div className="Content">
        <div className="Sidebar">
          <button
            className={`SquareButton ${mode === "loadUnload" ? "active" : ""}`}
            onClick={handleLoadUnload}
          >
            <PiCraneTowerLight /> Load/Unload
          </button>
          <button
            className={`SquareButton ${mode === "balance" ? "active" : ""}`}
            onClick={handleBalance}
          >
            <MdBalance /> Balance
          </button>
          <button className="SquareButton" onClick={handleSaveManifest}>
            <GiSave /> Save Manifest
          </button>
          <button className="SquareButton" onClick={triggerFileInput}>
            <TbFileDownload /> Load Manifest
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleLoadManifest} // Ensure this function is defined and imported if needed
          />
        </div>
        <div className="MainContent">
          <div className="TopControlBar">
            <button
              className="StartButton"
              disabled={!isActive}
              onClick={handleStart}
            >
              Start
            </button>
            <input
              type="text"
              placeholder={currentUser || "Enter your name"} // Show current user as placeholder if available
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={handleLogin}>Log In</button>
          </div>
          <StepControlBar
            isActive={isActive}
            index={stepIndex}
            steps={steps}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
          />
          <div className="MainView">
            <LogPanel />
            <ManifestView grid={grids?.[stepIndex]} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

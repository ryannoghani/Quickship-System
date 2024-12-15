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
import LoadUnloadOperation from "./functions/LoadUnloadOperation.js";
import Container from "./functions/Container.js";
import Clock from "./functions/Clock.js";
import BufferView from "./components/BufferView.js";

function App() {
  const fileInputRef = useRef(null);
  const [isActive, setIsActive] = useState(false); // True when file is loaded
  const [manifestFile, setManifestFile] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Clock());
  const [mode, setMode] = useState("loadUnload"); //Used to dynamically change behavior of Start button between balance and load/unload
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [log, setLog] = useState([]);
  const [steps, setSteps] = useState([]); // Step descriptions generated in a session
  const [grids, setGrids] = useState([]); // Array of manifests to display in a session
  const [stepIndex, setStepIndex] = useState(0); // Tracks current step that is displayed
  const [completedSteps, setCompletedSteps] = useState(new Set()); // Tracks completed steps
  const [selectedCells, setSelectedCells] = useState([]);
  const [bufferGrids, setBufferGrids] = useState([]);

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleLoadManifest = (event) => {
    if (
      isActive === true &&
      !window.confirm(
        "A session is already active. Overwrite it and start a new one? Unsaved progress will be lost."
      )
    ) {
      return;
    }
    setSteps([]);
    setStepIndex(0);
    setCompletedSteps(new Set());
    setSelectedCells([]);
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

    setIsActive(true);
  };

  const handleSaveManifest = () => {
    if (grids.length === 0) {
      alert("Cannot complete save because no file is loaded.");
      return;
    }
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
      setCurrentDateTime(new Clock());
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

  const handleDoneStep = () => {
    alert("Don't forget to save and email the manifest.");
    setIsActive(false);
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
      setGrids(balanceOp.gridList);
      setBufferGrids(balanceOp.bufferGridList);
      setSteps(balanceOp.operationList);
    }
    if (mode === "loadUnload") {
      //names of cells to unload
      const names = Array.from(selectedCells.values());
      const unloadList = names.map((name) => ({ name }));
      const numLoad = prompt("Enter the number of containers to load");
      let loadList = [];

      for (let i = 0; i < numLoad; i++) {
        const container = new Container();
        container.name = "%SETNAME%";
        loadList.push(container);
      }
      const loadUnloadOp = new LoadUnloadOperation(
        grids[0],
        loadList,
        unloadList
      );
      loadUnloadOp.LoadUnloadOperationSearch();

      setSteps(loadUnloadOp.operationList);
      setGrids(loadUnloadOp.shipGridList);
      setBufferGrids(loadUnloadOp.bufferGridList);
    }
  };

  const handleCellClick = (name, boolAdd) => {
    if (boolAdd) {
      setSelectedCells((prevCells) => [...prevCells, name]);
    } else {
      const index = selectedCells.indexOf(name);

      if (index !== -1) {
        const copy = [...selectedCells];
        copy.splice(index, 1);
        setSelectedCells(copy);
      }
    }
  };

  return (
    <div className="App">
      <div className="TopBar">
        <div className="AppName">QuickShip</div>
        <div className="Time">{currentDateTime.GetTime()}</div>
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
            onDone={handleDoneStep}
          />
          <div className="MainView">
            <LogPanel />
            <ManifestView
              grid={grids?.[stepIndex]}
              onCellClick={handleCellClick}
              stepIndex={stepIndex}
            />
            <BufferView grid={bufferGrids?.[stepIndex]} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { MdBalance } from "react-icons/md";
import { PiCraneTowerLight } from "react-icons/pi";
import { IoIosLogIn } from "react-icons/io";
import { TbFileDownload } from "react-icons/tb";
import { GiSave } from "react-icons/gi";
import ManifestView from "./components/ManifestView.js";
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
  const [messageBuffer, setMessageBuffer] = useState("");
  const [logs, setLogs] = useState("");
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
      addLog(
        "Manifest " +
          event.target.files[0].name +
          " is opened, there are " +
          translator.numContainers +
          " containers on the ship"
      );
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

      a.download = manifestFile.name.replace(".txt", "OUTBOUND.txt");
      a.href = URL.createObjectURL(blob);
      a.addEventListener("click", (e) => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
      });
      a.click();
    };

    let translator = new ManifestGridTranslator();
    let content = translator.ConvertGridToManifest(grids[stepIndex]);
    saveFile(content);
    alert("Don't forget to send the manifest.");

    addLog(
      "Finished a Cycle. Manifest " +
        manifestFile.name.replace(".txt", "OUTBOUND.txt") +
        " was written to desktop, and a reminder pop-up to operator to send file was displayed."
    );
  };

  const handleDownloadLogs = () => {
    const saveFile = async (content) => {
      const blob = new Blob([content], { type: "text/plain" });
      const a = document.createElement("a");

      a.download = "KeoghPort" + currentDateTime.GetYear() + ".txt";
      a.href = URL.createObjectURL(blob);
      a.addEventListener("click", (e) => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
      });
      a.click();
    };

    saveFile(logs);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Clock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    const user = prompt("Enter a username");
    if (user === null) {
      return;
    }

    addLog(user + " signs in");
  };

  const handleLoadUnload = () => {
    console.log("Load/Unload action triggered");
    setMode("loadUnload");
  };

  const handleBalance = () => {
    console.log("Balance action triggered");
    setMode("balance");
  };

  const handleDoneStep = () => {
    alert("Don't forget to save and email the manifest.");
    setIsActive(false);
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

  const addLog = (msg) => {
    setLogs(
      (oldLog) =>
        oldLog + currentDateTime.GetTimeLogFormat() + "\t" + msg + "\n"
    );
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
          <button className="SquareButton" onClick={handleDownloadLogs}>
            <GiSave /> Download Logs
          </button>
          <button className="SquareButton" onClick={handleLogin}>
            <IoIosLogIn /> Login
          </button>
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
              placeholder={"Enter a message"} // Show current user as placeholder if available
              value={messageBuffer}
              onChange={(e) => setMessageBuffer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addLog(messageBuffer);
                  setMessageBuffer("");
                }
              }}
            />
          </div>
          <StepControlBar
            isActive={isActive}
            index={stepIndex}
            steps={steps}
            onPrev={() => {
              if (stepIndex > 0) {
                setStepIndex(stepIndex - 1);
              }
            }}
            onNext={() => {
              if (stepIndex < grids.length - 1) {
                setStepIndex(stepIndex + 1);
              }
            }}
            onDone={handleDoneStep}
          />
          <div className="MainView">
            <textarea
              value={logs}
              readOnly
              rows="4"
              cols="50"
              style={{ backgroundColor: "#ddd" }}
            />
            <ManifestView
              grid={grids?.[stepIndex]}
              onCellClick={handleCellClick}
              stepIndex={stepIndex}
              onLoad={(containerName) =>
                addLog('"' + containerName + '" is onloaded.')
              }
            />
            <BufferView grid={bufferGrids?.[stepIndex]} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { MdBalance } from "react-icons/md";
import { PiCraneTowerLight } from "react-icons/pi";
import { TbFileDownload } from "react-icons/tb";
import { GiSave } from "react-icons/gi";

function App() {
  const fileInputRef = useRef(null);
  const [gridData, setGridData] = useState(
    Array(10).fill(Array(12).fill({ type: "UNUSED", content: "" }))
  );
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [mode, setMode] = useState("loadUnload"); // Default mode
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [log, setLog] = useState([]);
  const [steps, setSteps] = useState([
    "Step 1: Move from Ship to Truck",
    "Step 2: Move from Dock to Buffer",
  ]); // Example steps
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set()); // Tracks completed steps
  const [selectedCell, setSelectedCell] = useState(null); // State to track the clicked cell

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input not available");
    }
  };
  useEffect(() => {
    // This will log the ref to see if it is correctly assigned
    console.log(fileInputRef.current);
  }, []);
  const gridRows = 10;
  const gridColumns = 12;
  const grid = Array.from({ length: gridRows }, () =>
    Array.from({ length: gridColumns }, () => 0)
  );

  const handleLoadManifest = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      console.log("File Read Complete:", e.target.result); // Log raw file content
      const lines = e.target.result.split("\n");
      const newGridData = gridData.map((row) => [...row]); // Deep copy of the current grid data

      lines.forEach((line, index) => {
        const parts = line.replace(/\[|\]|"/g, "").split(",");
        console.log(`Line ${index}:`, parts); // Log each parsed line

        if (parts.length < 3) {
          console.error(`Skipping malformed line ${index}:`, line);
          return; // Skip this iteration if not enough parts
        }

        const [cell, weight, description] = parts;
        const [row, col] = cell.split(",").map(Number);
        if (!description) {
          console.error(`Description missing in line ${index}:`, line);
          return; // Skip if description is missing
        }

        const trimmedDescription = description.trim();
        if (trimmedDescription === "NAN") {
          newGridData[row - 1][col - 1] = { type: "NAN", content: "" };
        } else if (trimmedDescription === "UNUSED") {
          newGridData[row - 1][col - 1] = { type: "UNUSED", content: "" };
        } else {
          newGridData[row - 1][col - 1] = {
            type: "CONTAINER",
            content: trimmedDescription.substring(0, 6),
          }; // Limit to 6 letters
        }
      });

      console.log("Updated Grid Data:", newGridData); // Log the new grid data structure
      setGridData(newGridData); // Update the state
    };
  };

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markStepDone = () => {
    if (completedSteps.has(currentStep)) {
      // If the step is already marked as completed, create a new Set without this step
      setCompletedSteps(
        new Set([...completedSteps].filter((step) => step !== currentStep))
      );
    } else {
      // Otherwise, add this step to the Set of completed steps
      setCompletedSteps(new Set(completedSteps.add(currentStep)));
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
          <button
            className="SquareButton"
            onClick={() => console.log("Save Manifest")}
          >
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
            <button className="StartButton">Start</button>
            <input
              type="text"
              placeholder={currentUser || "Enter your name"} // Show current user as placeholder if available
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={handleLogin}>Log In</button>
          </div>
          <div className="StepControlBar">
            <button onClick={handlePrevStep}>Back</button>
            <span
              className={`StepDetail ${
                completedSteps.has(currentStep) ? "completed" : ""
              }`}
            >
              From: {steps[currentStep]}
            </span>
            <button onClick={markStepDone}>Done</button>
            <button onClick={handleNextStep}>Next</button>
          </div>
          <div className="MainContent2">
            <div className="LeftPanel">
              <p>Additional controls and information will go here.</p>
            </div>
            <div className="RightPanel">
              {gridData.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`GridCell ${cell.type}`}
                    style={{
                      backgroundColor:
                        cell.type === "NAN"
                          ? "darkgray"
                          : cell.type === "UNUSED"
                          ? "lightgray"
                          : cell.type === "CONTAINER"
                          ? "skyblue"
                          : "transparent",
                      color: cell.type === "CONTAINER" ? "black" : "dimgray",
                    }}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell.content} {/* Displaying the name or content */}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

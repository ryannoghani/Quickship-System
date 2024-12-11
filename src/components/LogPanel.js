import React, { useState } from "react";
import "./LogPanel.css";

export default function LogPanel({ log, addToLog }) {
  const [inputValue, setInputValue] = useState(""); // Local state to handle input for new log entries

  return (
    <div className="LogPanel">
      <div className="LogDisplay" style={{ overflowY: 'auto', height: '100px' }}>
        {log.slice(-7).map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add a log entry..."
        style={{ width: '100%', height: '50px' }}
      />
      <button onClick={() => {
        addToLog(inputValue);
        setInputValue('');
      }}>Add Log Entry</button>
      <p>Additional controls and information will go here.</p>
    </div>
  );
}

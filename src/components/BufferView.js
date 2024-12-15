import React, { useState } from "react";
import "./BufferView.css";

export default function BufferView({
  grid = Array.from({ length: 4 }, () =>
    Array.from({ length: 24 }, () => ({ type: "UNUSED", content: "" }))
  ),
}) {
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
  };

  return (
    <div className="BufferView">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`GridCell ${cell.type}`}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            title={cell.type === "CONTAINER" ? cell.name : ""}
            style={{
              backgroundColor: getBackgroundColor(cell.type),
              color: getColor(cell.type),
            }}
          >
            {cell.content}
          </div>
        ))
      )}
    </div>
  );
}

function getBackgroundColor(type) {
  switch (type) {
    case "NAN":
      return "darkgray";
    case "UNUSED":
      return "lightgray";
    case "CONTAINER":
      return "skyblue";
    default:
      return "transparent";
  }
}

function getColor(type) {
  return type === "CONTAINER" ? "black" : "dimgray";
}

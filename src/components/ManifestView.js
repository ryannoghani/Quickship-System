import { React, useState } from "react";
import "./ManifestView.css";

//This component is purely responsible for displaying a 2d grid that's passed to it

export default function ManifestView({
  grid = Array(10).fill(Array(12).fill({ type: "UNUSED", content: "" })),
}) {
  const [selectedCell, setSelectedCell] = useState(null); // State to track the clicked cell

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    console.log(`Cell clicked: Row ${row}, Column ${col}`);
  };

  return (
    <div className="ManifestView">
      {grid.map((row, rowIndex) =>
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
            title={cell.type === "CONTAINER" ? cell.name : ""} // Add a tooltip for container cells
          >
            {cell.content} {/* Displaying the name or content */}
          </div>
        ))
      )}
    </div>
  );
}

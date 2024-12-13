import { React, useState } from "react";
import "./ManifestView.css";

//This component is purely responsible for displaying a 2d grid that's passed to it

export default function ManifestView({
  grid = Array(10).fill(Array(12).fill({ name: "UNUSED", weight: "0" })),
}) {
  const [selectedCell, setSelectedCell] = useState(null);

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
            className={`GridCell ${cell.name}`}
            style={{
              backgroundColor:
                cell.name === "NAN"
                  ? "darkgray"
                  : cell.name === "UNUSED"
                  ? "lightgray"
                  : "skyblue",
              color: "black",
            }}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            title={cell.name}
          >
            {cell.name !== "UNUSED" && cell.name !== "NAN"
              ? cell.name.substring(0, 3)
              : ""}
          </div>
        ))
      )}
    </div>
  );
}

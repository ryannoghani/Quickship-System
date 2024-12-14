import { React, useState } from "react";
import "./ManifestView.css";
import GridCell from "./GridCell";

//This component is purely responsible for displaying a 2d grid that's passed to it

export default function ManifestView({
  grid = Array(10).fill(Array(12).fill({ name: "UNUSED", weight: "0" })),
  onCellClick,
}) {
  // const [selectedCell, setSelectedCell] = useState(null); // State to track the clicked cell

  // const handleClick = (row, col) => {
  //   setSelectedCell({ row, col });
  //   console.log(`Cell clicked: Row ${row}, Column ${col}`);
  // };

  return (
    <div className="ManifestView">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GridCell
            rowIndex={rowIndex}
            colIndex={colIndex}
            cell={cell}
            onClick={onCellClick}
          />
        ))
      )}
    </div>
  );
}

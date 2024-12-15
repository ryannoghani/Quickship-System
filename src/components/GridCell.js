import { React, useState, useEffect } from "react";

export default function GridCell({
  rowIndex,
  colIndex,
  stepIndex,
  cell,
  onClick,
}) {
  const [isHighlight, setHighlight] = useState(false);

  useEffect(() => {
    if (stepIndex > 0) {
      setHighlight(false);
    }
  }, [stepIndex]);

  const getBackgroundColor = (name) => {
    if (name === "NAN") return "darkgray";
    if (name === "UNUSED") return "lightgray";
    return "skyblue";
  };

  if (cell.name === "%SETNAME%") {
    cell.name = prompt("Enter a name");
    cell.weight = prompt("Enter a weight in kg");
  }

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={`GridCell ${cell.name}`}
      style={{
        backgroundColor:
          isHighlight && stepIndex === 0
            ? "yellow"
            : getBackgroundColor(cell.name),
        color: "black",
      }}
      onClick={() => {
        if (cell.name === "NAN" || cell.name === "UNUSED") {
          return;
        }
        if (isHighlight) {
          setHighlight(false);
          onClick(cell.name, false);
        } else {
          setHighlight(true);
          onClick(cell.name, true);
        }
      }}
      title={cell.name}
    >
      {cell.name !== "UNUSED" && cell.name !== "NAN"
        ? cell.name.substring(0, 3)
        : ""}
    </div>
  );
}
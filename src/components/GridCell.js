import React from "react";

export default function GridCell({ rowIndex, colIndex, cell, onClick }) {
  // Determine the background color based on the cell's name
  const getBackgroundColor = (name) => {
    if (name === "NAN") return "darkgray";
    if (name === "UNUSED") return "lightgray";
    return "skyblue";
  };

  let name = cell.name;
  let weight = cell.weight;

  if (cell.name === "SETNAME") {
    name = prompt("Enter a name");
    weight = prompt("Enter a weight in kg");
  }

  return (
    <div
      key={`${rowIndex}-${colIndex}`}
      className={`GridCell ${name}`}
      style={{
        backgroundColor: getBackgroundColor(name),
        color: "black",
      }}
      onClick={onClick}
      title={name}
    >
      {name !== "UNUSED" && name !== "NAN" ? name.substring(0, 3) : ""}
    </div>
  );
}

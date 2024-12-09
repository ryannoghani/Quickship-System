import Container from "./Container";
function ManhattanDistance(startingLocation, endingLocation) {
  return (
    Math.abs(startingLocation[1] - endingLocation[1]) +
    Math.abs(startingLocation[2] - endingLocation[2])
  );
}

export default function CalculateTransferCost(
  startingLocation,
  endingLocation
) {
  if (startingLocation[0] === endingLocation[0]) {
    //For ship to ship, or buffer to buffer, we calculate a simple manhattan distance
    return ManhattanDistance(startingLocation, endingLocation);
  } else if (startingLocation[0] === "SHIP" && endingLocation[0] === "BUFFER") {
    //For ship to buffer, we need to add an extra 4 to the cost
    return (
      ManhattanDistance(startingLocation, ["SHIP", 1, 0]) +
      4 +
      ManhattanDistance(["BUFFER", 0, 23], endingLocation)
    );
  } else if (startingLocation[0] === "BUFFER" && endingLocation[0] === "SHIP") {
    return (
      ManhattanDistance(endingLocation, ["SHIP", 1, 0]) +
      4 +
      ManhattanDistance(["BUFFER", 0, 23], startingLocation)
    );
  } else if (
    startingLocation[0] === "SHIP" &&
    endingLocation[0] === "LOADING ZONE"
  ) {
    //For ship to loading zone, we need to add an extra 2 minutes to the cost
    return ManhattanDistance(startingLocation, ["SHIP", 1, 0]) + 2;
  } else if (
    startingLocation[0] === "LOADING ZONE" &&
    endingLocation[0] === "SHIP"
  ) {
    //For ship to loading zone, we need to add an extra 2 minutes to the cost
    return ManhattanDistance(endingLocation, ["SHIP", 1, 0]) + 2;
  } else if (
    startingLocation[0] === "BUFFER" &&
    endingLocation[0] === "LOADING ZONE"
  ) {
    //For buffer to loading zone, we need to add an extra 2 minutes to the cost
    return ManhattanDistance(startingLocation, ["BUFFER", 0, 23]) + 2;
  } else if (
    startingLocation[0] === "LOADING ZONE" &&
    endingLocation[0] === "BUFFER"
  ) {
    //For buffer to loading zone, we need to add an extra 2 minutes to the cost
    return ManhattanDistance(endingLocation, ["BUFFER", 0, 23]) + 2;
  } else {
    console.log(
      "Error: the area of the problem you specified doesn't exist. The only choices are SHIP, BUFFER, and LOADING ZONE"
    );
    return undefined;
  }
}

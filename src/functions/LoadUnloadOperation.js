import LoadUnloadShipState from "./LoadUnloadShipState.js";
import LoadUnloadHeuristic from "./LoadUnloadHeuristic.js";
import Container from "./Container.js";

export default class LoadUnloadOperation {
  constructor(grid, _loadList, _unloadList) {
    // Code to change grid with only ship to contain both ship and buffer
    let buffer_ship_grid = []; //This will eventually become a 10 row, 39 column 2d array
    for (let i = 0; i < 10; ++i) {
      buffer_ship_grid[i] = [];
      for (let j = 0; j < 39; ++j) {
        buffer_ship_grid[i][j] = new Container(); //For now, every slot on the buffer_ship_grid is set to UNUSED, but we will change this in the upcoming lines
      }
    }
    for (let i = 0; i < 10; ++i) {
      //This is basically pasting over the grid onto the right half of buffer_ship_grid
      for (let j = 0; j < 12; ++j) {
        buffer_ship_grid[i][j + 27] = grid[i][j];
      }
    }
    for (let i = 6; i < 10; ++i) {
      //Technically, the buffer is only 5 rows, not 10. So for its lower 5 rows, we set each slot to NAN so that containers are never moved there during the search
      for (let j = 0; j < 24; ++j) {
        buffer_ship_grid[i][j].name = "NAN";
        buffer_ship_grid[i][j].weight = 0; //It should never be the case that the weight isnt already 0, but I put this here just in case
      }
    }
    for (let j = 0; j < 27; ++j) {
      //For now, lets assume the operator can move containers to the same row as the left pink virtual cell. This means the whole row should be intialized to UNUSED, so future containers may move there
      buffer_ship_grid[0][j].name = "UNUSED";
      buffer_ship_grid[0][j].weight = 0;
    }
    for (let i = 2; i < 10; ++i) {
      //The area below our bridge should never be accessed either. The bridge is at row index 1, by the way
      for (let j = 24; j < 27; ++j) {
        buffer_ship_grid[i][j].name = "NAN";
        buffer_ship_grid[i][j].weight = 0;
      }
    }
    let unloadMap = new Map(); //maps how many containers of a specific name to take out
    for (let i = 0; i < _unloadList.length; i++) {
      if (unloadMap.has(_unloadList[i].name)) {
        //if already in map, increment
        unloadMap.set(
          _unloadList[i].name,
          unloadMap.get(_unloadList[i].name) + 1
        );
      } else {
        //new map item
        unloadMap.set(_unloadList[i].name, 1);
      }
    }
    this.containerIDMap = new Map();
    this.startState = new LoadUnloadShipState(
      buffer_ship_grid,
      27,
      1,
      null,
      0,
      LoadUnloadHeuristic(_loadList, unloadMap, buffer_ship_grid),
      "",
      unloadMap,
      _loadList,
      this.CreateKey(buffer_ship_grid, 27, 1),
      23
    );
    this.frontier = new PriorityQueue();
    this.visitedStates = new Set();
    this.operationList = [];
    this.shipGridList = [];
    this.bufferGridList = [];
    this.containerList = [];
    this.goalState = undefined;
    this.replacementContainer = new Container();
    this.numContainers = 0;
    this.unloadContainerColumns = new Set();
    for (let i = 2; i < 10; i++) {
      for (let j = 27; j < 39; j++) {
        if (
          buffer_ship_grid[i][j].name != "NAN" &&
          buffer_ship_grid[i][j].name != "UNUSED"
        ) {
          this.numContainers++;
          if (unloadMap.has(buffer_ship_grid[i][j].name)) {
            this.unloadContainerColumns.add(j);
          }
        }
      }
    }
  }
  // Create an array for the list of operations and the list of grids
  CreateLists(goalState) {
    let currState = goalState;
    if (currState == this.startState) {
      this.operationList.unshift("The ship has already been loaded/unloaded.");
      this.containerList.unshift(null);
    }
    if (!(goalState.craneX == 27 && goalState.craneY == 1)) {
      this.operationList.unshift(
        "Move crane back to starting location at (9, 1)"
      );
      this.containerList.unshift(null);
    }
    while (currState != null) {
      if (currState.operation != "") {
        this.operationList.unshift(currState.operation);
        this.containerList.unshift(currState.loadContainer);
      }
      this.SplitGrid(currState);
      currState = currState.parent;
    }
  }
  // Split big grid with both ship and buffer into separate grids
  SplitGrid(state) {
    let bufferGrid = [];
    for (let i = 2; i < 6; i++) {
      bufferGrid[i - 2] = [];
      for (let j = 0; j < 24; j++) {
        bufferGrid[i - 2][j] = state.grid[i][j];
      }
    }
    this.bufferGridList.unshift(bufferGrid);
    let shipGrid = [];
    for (let i = 0; i < 10; i++) {
      shipGrid[i] = [];
      for (let j = 0; j < 12; j++) {
        shipGrid[i][j] = state.grid[i][j + 27];
      }
    }
    this.shipGridList.unshift(shipGrid);
  }
  // Calculate total cost of an operation
  CalculateCost(craneX, craneY, boxStartCol, boxEndCol, topContainers) {
    return (
      this.CostCranetoBox(craneX, craneY, boxStartCol, topContainers) +
      this.CostBoxtoBox(boxStartCol, boxEndCol, topContainers)
    );
  }
  // Calculates cost to move container to a specific location
  CostBoxtoBox(boxStartCol, boxEndCol, topContainers) {
    if (boxStartCol === boxEndCol) {
      return 0;
    }
    if (topContainers[boxStartCol] > 9) {
      return 9999;
    }
    let startIsLeft = true;
    if (boxStartCol > boxEndCol) {
      startIsLeft = false;
    }
    let startHeight = 9 - topContainers[boxStartCol];
    let endHeight = 9 - topContainers[boxEndCol];
    let movementUp = -1;
    if (startIsLeft) {
      for (let i = boxStartCol + 1; i <= boxEndCol - 1; i++) {
        movementUp = Math.max(movementUp, 9 - topContainers[i] - startHeight);
      }
    } else {
      for (let i = boxStartCol - 1; i >= boxEndCol + 1; i--) {
        movementUp = Math.max(movementUp, 9 - topContainers[i] - startHeight);
      }
    }
    movementUp += 1;
    let cost = 0;
    cost += movementUp;
    cost += Math.abs(boxEndCol - boxStartCol);
    cost += Math.abs(endHeight + 1 - (startHeight + movementUp));
    return cost;
  }
  // Calculates cost to move crane to container
  CostCranetoBox(craneX, craneY, boxCol, topContainers) {
    if (craneX === boxCol && craneY === topContainers[boxCol]) {
      return 0;
    }
    if (topContainers[boxCol] > 9 || craneY > topContainers[craneX]) {
      return 9999;
    }
    let cost = 0;
    if (craneY === topContainers[craneX]) {
      cost++;
      craneY--;
    }
    let craneIsLeft = true;
    if (craneX > boxCol) {
      craneIsLeft = false;
    }
    let craneHeight = 9 - craneY;
    let boxHeight = 9 - topContainers[boxCol];
    let movementUp = -1;
    if (craneIsLeft) {
      for (let i = craneX + 1; i <= boxCol - 1; i++) {
        movementUp = Math.max(movementUp, 9 - topContainers[i] - craneHeight);
      }
    } else {
      for (let i = craneX - 1; i >= boxCol + 1; i--) {
        movementUp = Math.max(movementUp, 9 - topContainers[i] - craneHeight);
      }
    }
    movementUp++;
    cost += movementUp;
    cost += Math.abs(craneX - boxCol);
    cost += Math.abs(boxHeight + 1 - (craneHeight + movementUp));
    cost++;
    return cost;
  }
  // Operation function that expands the given load/unload state
  ExpandLoadUnloadState(state) {
    this.visitedStates.add(state.key);
    // Moving a container that is in the ship
    if (state.unloadMap.size > 0) {
      for (let i = 27; i < 39; i++) {
        let originalY = state.topContainer[i];
        if (
          !(i === state.craneX && originalY === state.craneY) &&
          originalY < 10 &&
          state.grid[originalY][i].name !== "NAN"
        ) {
          // Unload container from ship
          if (state.unloadMap.has(state.grid[originalY][i].name)) {
            let newGrid = [];
            for (let k = 0; k < state.height; k++) {
              if (k == originalY) {
                newGrid[k] = [];
                for (let l = 0; l < state.width; l++) {
                  newGrid[k][l] = state.grid[k][l];
                }
              } else {
                newGrid[k] = state.grid[k];
              }
            }
            let unloadContainer = newGrid[originalY][i];
            newGrid[originalY][i] = this.replacementContainer;
            let key = this.CreateKey(newGrid, 25, 1);
            if (!this.visitedStates.has(key)) {
              let currCost = this.CalculateCost(
                state.craneX,
                state.craneY,
                i,
                25,
                state.topContainer
              );
              let newMap = new Map(state.unloadMap);
              let val = newMap.get(state.grid[originalY][i].name);
              if (val <= 1) {
                newMap.delete(state.grid[originalY][i].name);
              } else {
                newMap.set(state.grid[originalY][i].name, val - 1);
              }
              let newState = new LoadUnloadShipState(
                newGrid,
                25,
                1,
                state,
                state.gCost + currCost,
                LoadUnloadHeuristic(state.loadList, newMap, newGrid),
                "Move crane to " +
                  "(" +
                  (10 - originalY) +
                  ", " +
                  (i - 26) +
                  ") in the ship with a weight of " +
                  unloadContainer.weight +
                  " and unload container (Estimate " +
                  currCost +
                  " minutes)",
                newMap,
                state.loadList,
                key,
                state.bufferCol
              );
              this.frontier.add(newState);
            }
          } else {
            if (this.unloadContainerColumns.has(i)) {
              if (this.numContainers >= 48) {
                // Move container from ship to buffer
                let j = state.bufferCol;
                let finalY = state.topContainer[j] - 1;
                let newGrid = [];
                for (let k = 0; k < state.height; k++) {
                  if (k == originalY || k == finalY) {
                    newGrid[k] = [];
                    for (let l = 0; l < state.width; l++) {
                      newGrid[k][l] = state.grid[k][l];
                    }
                  } else {
                    newGrid[k] = state.grid[k];
                  }
                }
                let temp = newGrid[finalY][j];
                newGrid[finalY][j] = newGrid[originalY][i];
                newGrid[originalY][i] = temp;
                let key = this.CreateKey(newGrid, j, finalY);
                if (!this.visitedStates.has(key)) {
                  let bufferVal = j;
                  if (finalY <= 2) {
                    bufferVal--;
                  }
                  let currCost = this.CalculateCost(
                    state.craneX,
                    state.craneY,
                    i,
                    j,
                    state.topContainer
                  );
                  let newState = new LoadUnloadShipState(
                    newGrid,
                    j,
                    finalY,
                    state,
                    state.gCost + currCost,
                    LoadUnloadHeuristic(
                      state.loadList,
                      state.unloadMap,
                      newGrid
                    ),
                    "Move crane to " +
                      "(" +
                      (10 - originalY) +
                      ", " +
                      (i - 26) +
                      ") in the ship and move container to (" +
                      (6 - finalY) +
                      ", " +
                      (j + 1) +
                      ") in the buffer (Estimate " +
                      currCost +
                      " minutes)",
                    state.unloadMap,
                    state.loadList,
                    key,
                    bufferVal
                  );
                  this.frontier.add(newState);
                }
              }
              // Move container within ship
              for (let j = 27; j < 39; j++) {
                let finalY = state.topContainer[j] - 1;
                if (j !== i && finalY >= 0) {
                  let newGrid = [];
                  for (let k = 0; k < state.height; k++) {
                    if (k == originalY || k == finalY) {
                      newGrid[k] = [];
                      for (let l = 0; l < state.width; l++) {
                        newGrid[k][l] = state.grid[k][l];
                      }
                    } else {
                      newGrid[k] = state.grid[k];
                    }
                  }
                  let temp = newGrid[finalY][j];
                  newGrid[finalY][j] = newGrid[originalY][i];
                  newGrid[originalY][i] = temp;
                  let key = this.CreateKey(newGrid, j, finalY);
                  if (!this.visitedStates.has(key)) {
                    let currCost = this.CalculateCost(
                      state.craneX,
                      state.craneY,
                      i,
                      j,
                      state.topContainer
                    );
                    let newState = new LoadUnloadShipState(
                      newGrid,
                      j,
                      finalY,
                      state,
                      state.gCost + currCost,
                      LoadUnloadHeuristic(
                        state.loadList,
                        state.unloadMap,
                        newGrid
                      ),
                      "Move crane to " +
                        "(" +
                        (10 - originalY) +
                        ", " +
                        (i - 26) +
                        ") in the ship and move container to (" +
                        (10 - finalY) +
                        ", " +
                        (j - 26) +
                        ") in the ship (Estimate " +
                        currCost +
                        " minutes)",
                      state.unloadMap,
                      state.loadList,
                      key,
                      state.bufferCol
                    );
                    this.frontier.add(newState);
                  }
                }
              }
            }
          }
        }
      }
    }
    // Load container onto ship
    if (state.loadList.length > 0) {
      let newLoadList = [...state.loadList];
      let loadContainer = newLoadList.pop();
      for (let j = 27; j < 39; j++) {
        let finalY = state.topContainer[j] - 1;
        if (finalY >= 0) {
          let newGrid = [];
          for (let k = 0; k < state.height; k++) {
            if (k == finalY) {
              newGrid[k] = [];
              for (let l = 0; l < state.width; l++) {
                newGrid[k][l] = state.grid[k][l];
              }
            } else {
              newGrid[k] = state.grid[k];
            }
          }
          newGrid[finalY][j] = loadContainer;
          let key = this.CreateKey(newGrid, j, finalY);
          if (!this.visitedStates.has(key)) {
            let currCost =
              this.CalculateCost(
                state.craneX,
                state.craneY,
                25,
                j,
                state.topContainer
              ) - 2;
            let newState = new LoadUnloadShipState(
              newGrid,
              j,
              finalY,
              state,
              state.gCost + currCost,
              LoadUnloadHeuristic(newLoadList, state.unloadMap, newGrid),
              "Move crane to a truck and move container to (" +
                (10 - finalY) +
                ", " +
                (j - 26) +
                ") in the ship (Estimate " +
                currCost +
                " minutes)",
              state.unloadMap,
              newLoadList,
              key,
              state.bufferCol,
              loadContainer
            );
            this.frontier.add(newState);
          }
        }
      }
    }
    // Move container from buffer to ship
    let i = state.bufferCol;
    let originalY = state.topContainer[i];
    if (!(i == 23 && originalY == 6)) {
      for (let j = 27; j < 39; j++) {
        let finalY = state.topContainer[j] - 1;
        if (finalY >= 0) {
          let newGrid = [];
          for (let k = 0; k < state.height; k++) {
            if (k == originalY || k == finalY) {
              newGrid[k] = [];
              for (let l = 0; l < state.width; l++) {
                newGrid[k][l] = state.grid[k][l];
              }
            } else {
              newGrid[k] = state.grid[k];
            }
          }
          let temp = newGrid[finalY][j];
          newGrid[finalY][j] = newGrid[originalY][i];
          newGrid[originalY][i] = temp;
          let key = this.CreateKey(newGrid, j, finalY);
          if (!this.visitedStates.has(key)) {
            let bufferVal = j;
            if (originalY >= 5) {
              bufferVal++;
            }
            let currCost = this.CalculateCost(
              state.craneX,
              state.craneY,
              i,
              j,
              state.topContainer
            );
            let newState = new LoadUnloadShipState(
              newGrid,
              j,
              finalY,
              state,
              state.gCost + currCost,
              LoadUnloadHeuristic(state.loadList, state.unloadMap, newGrid),
              "Move crane to " +
                "(" +
                (6 - originalY) +
                ", " +
                (i + 1) +
                ") in the buffer and move container to (" +
                (10 - finalY) +
                ", " +
                (j - 26) +
                ") in the ship (Estimate " +
                currCost +
                " minutes)",
              state.unloadMap,
              state.loadList,
              key,
              bufferVal
            );
            this.frontier.add(newState);
          }
        }
      }
    }
  }
  // Load/unload A* search with frontier and map for visited states
  LoadUnloadOperationSearch() {
    this.frontier.add(this.startState);
    this.visitedStates.add(this.startState.grid);
    while (this.frontier.heap.length > 0) {
      let currState = this.frontier.remove();
      // console.log(process.memoryUsage());
      console.log(this.frontier.heap.length);
      console.log(this.visitedStates.size);
      if (currState.hCost === 0) {
        this.CreateLists(currState);
        this.goalState = currState;
        break;
      }
      this.ExpandLoadUnloadState(currState);
    }
  }
  // Find container ID from map, save memory going from string to int
  GetContainerID(containerName) {
    if (this.containerIDMap.has(containerName)) {
      return this.containerIDMap.get(containerName);
    } else {
      let size = this.containerIDMap.size;
      this.containerIDMap.set(containerName, size);
      return size;
    }
  }
  // Convert grid into a flat list of integers
  ConvertGrid(grid) {
    let IDList = [];
    for (let i = 2; i < 6; i++) {
      for (let j = 0; j < 24; j++) {
        IDList.push(this.GetContainerID(grid[i][j].name));
      }
    }
    for (let i = 0; i < 10; i++) {
      for (let j = 27; j < 39; j++) {
        IDList.push(this.GetContainerID(grid[i][j].name));
      }
    }
    return IDList;
  }
  // Hash flat list into int
  HashIDList(list) {
    let hash = 0;
    const prime = 31;
    for (let i = 0; i < list.length; i++) {
      hash = (hash * prime + list[i]) >>> 0;
    }
    return hash;
  }
  // Generate a unique key the grid and crane coordinates
  CreateKey(grid, craneX, craneY) {
    let flatGrid = this.ConvertGrid(grid);
    flatGrid.push(craneX, craneY);
    return this.HashIDList(flatGrid);
  }
}

// https://www.geeksforgeeks.org/implementation-priority-queue-javascript/
// Priority Queue implementation for the A* search frontier
class PriorityQueue {
  constructor() {
    this.heap = [];
  }
  getLeftChildIndex(parentIndex) {
    return 2 * parentIndex + 1;
  }
  getRightChildIndex(parentIndex) {
    return 2 * parentIndex + 2;
  }
  getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }
  hasLeftChild(index) {
    return this.getLeftChildIndex(index) < this.heap.length;
  }
  hasRightChild(index) {
    return this.getRightChildIndex(index) < this.heap.length;
  }
  hasParent(index) {
    return this.getParentIndex(index) >= 0;
  }
  leftChild(index) {
    return this.heap[this.getLeftChildIndex(index)];
  }
  rightChild(index) {
    return this.heap[this.getRightChildIndex(index)];
  }
  parent(index) {
    return this.heap[this.getParentIndex(index)];
  }
  swap(indexOne, indexTwo) {
    const temp = this.heap[indexOne];
    this.heap[indexOne] = this.heap[indexTwo];
    this.heap[indexTwo] = temp;
  }
  peek() {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }
  remove() {
    if (this.heap.length === 0) {
      return null;
    }
    const item = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return item;
  }
  add(item) {
    this.heap.push(item);
    this.heapifyUp();
  }
  heapifyUp() {
    let index = this.heap.length - 1;
    while (
      this.hasParent(index) &&
      this.comparePriority(this.parent(index), this.heap[index]) > 0
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }
  heapifyDown() {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (
        this.hasRightChild(index) &&
        this.comparePriority(this.leftChild(index), this.rightChild(index)) > 0
      ) {
        smallerChildIndex = this.getRightChildIndex(index);
      }
      if (
        this.comparePriority(this.heap[smallerChildIndex], this.heap[index]) > 0
      ) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  }
  comparePriority(state1, state2) {
    return state1.gCost + state1.hCost - (state2.gCost + state2.hCost);
  }
}

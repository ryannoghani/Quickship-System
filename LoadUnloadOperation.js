import LoadUnloadShipState from "./LoadUnloadShipState.js";
import heuristic from "./LoadUnloadHeuristic.js";

export default class LoadUnloadOperation {
  constructor(grid, _loadList, _unloadList) {
    let unloadMap = new Map(); //maps how many containers of a specific name to take out
    for (let i = 0; i < _unloadList.length; i++) {
      if (unloadMap.has(_unloadList[i])) { //if already in map, increment
        unloadMap.set(_unloadList[i], unloadMap.get(_unloadList[i]) + 1);
      }
      else { //new map item
        unloadMap.set(_unloadList[i], 1);
      }
    }
    this.startState = new LoadUnloadShipState(
      grid,
      0,
      1,
      null,
      0,
      this.LoadUnloadHeuristic(),
      "",
      unloadMap,
      _loadList
    );
    this.frontier = new PriorityQueue();
    this.visitedStates = new Set();
    this.operationList = [];
    this.gridList = [];
    this.goalState = undefined;
  }
  // Create an array for the list of operations and the list of grids
  CreateLists(goalState) {
    let currState = goalState;
    if(currState == this.startState) {
      this.operationList.unshift("The ship has already been loaded/unloaded.");
    }
    if(goalState.craneX != 0 && goalState.craneY != 1) {
      this.operationList.unshift("Move crane back to starting location at (1, 9)");
    }
    while(currState.parent != null) {
      this.operationList.unshift(currState.operation);
      this.gridList.unshift(currState.grid);
      currState = currState.parent;
    }
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
    if(boxStartCol === boxEndCol) {
      return 0;
    }
    if(topContainers[boxStartCol] > 9) {
      return 9999;
    }
    let startIsLeft = true;
    if(boxStartCol > boxEndCol) {
      startIsLeft = false;
    }
    let startHeight = 9 - topContainers[boxStartCol];
    let endHeight = 9 - topContainers[boxEndCol];
    let movementUp = -1;
    if(startIsLeft) {
      for(let i = boxStartCol + 1; i <= boxEndCol - 1; i++) {
        movementUp = Math.max(movementUp, 9 - topContainers[i] - startHeight);
      }
    }
    else {
      for(let i = boxStartCol - 1; i >= boxEndCol + 1; i--) {
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
    if(craneX === boxCol && craneY === topContainers[boxCol]) {
      return 0;
    }
    if(topContainers[boxCol] > 9 || craneY > topContainers[craneX]) {
      return 9999;
    }
    let cost = 0;
    if(craneY === topContainers[craneX]) {
      cost++;
      craneY--;
    }
    let craneIsLeft = true;
    if(craneX > boxCol) {
      craneIsLeft = false;
    }
    let craneHeight = 9 - craneY;
    let boxHeight = 9 - topContainers[boxCol];
    let movementUp = -1;
    if(craneIsLeft) {
      for(let i = craneX + 1; i <= boxCol - 1; i++) {
        movementUp = Math.max(movementUp, 9 - topContainers[i] - craneHeight);
      }
    }
    else {
      for(let i = craneX - 1; i >= boxCol + 1; i--) {
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
  // Load/unload heuristic function to guess the cost from a goal state
  LoadUnloadHeuristic(inList, outList, state) {
    return heuristic(inList, outList, grid);
  }
  // Operation function that expands the given load/unload state
  ExpandLoadUnloadState(state) {
    let key = "";
    for(let k = 0; k < state.grid.length; k++) {
      for(let l = 0; l < state.grid[k].length; l++) {
        key += state.grid[k][l].name;
      }
    }
    this.visitedStates.add(key);
    for(let i = 0; i < state.width; i++) {
      let originalY = state.topContainer[i];
      if(!(i === state.craneX && originalY === state.craneY) && originalY < 10 && state.grid[originalY][i].name !== "NAN") {
        for(let j = 0; j < state.width; j++) {
          let finalY = state.topContainer[j] - 1;
          if(j !== i && finalY >= 0) {
            let newGrid = [];
            for(let k = 0; k < state.height; k++) {
              newGrid[k] = [];
              for(let l = 0; l < state.width; l++) {
                newGrid[k][l] = state.grid[k][l];
              }
            }
            let temp = newGrid[finalY][j];
            newGrid[finalY][j] = newGrid[originalY][i];
            newGrid[originalY][i] = temp;
            if(!this.visitedStates.has(key)) {
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
                this.LoadUnloadHeuristic(
                  
                ),
                "Move crane to " +
                "(" +
                (10 - originalY) +
                ", " +
                (i + 1) +
                ") and move container to (" +
                (10 - finalY) +
                ", " +
                (j + 1) +
                ") (Estimate  " +
                currCost +
                " minutes)"
              );
              this.frontier.add(newState);
            }
          }
        }
      }
    }
  }
  // Load/unload A* search with frontier and map for visited states
  LoadUnloadOperationSearch() {
    this.frontier.add(this.startState);
    this.visitedStates.add(this.startState.grid);
    while(this.frontier.heap.length > 0) {
      let currState = this.frontier.remove();
      if(currState.hCost === 0) {
        this.CreateLists(currState);
        this.goalState = currState;
        break;
      }
      this.ExpandLoadUnloadState(currState);
    }
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
    if(this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }
  remove() {
    if(this.heap.length === 0) {
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
    while(this.hasParent(index) && this.comparePriority(this.parent(index), this.heap[index]) > 0) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }
  heapifyDown() {
    let index = 0;
    while(this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if(this.hasRightChild(index) && this.comparePriority(this.leftChild(index), this.rightChild(index)) > 0) {
        smallerChildIndex = this.getRightChildIndex(index);
      }
      if(this.comparePriority(this.heap[smallerChildIndex], this.heap[index]) > 0) {
        break;
      }
      else {
        this.swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  }
  comparePriority(state1, state2) {
    return state1.gCost + state1.hCost - (state2.gCost + state2.hCost);
  }
}
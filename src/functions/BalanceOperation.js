import BalanceShipState from "./BalanceShipState.js";
import CalculateTransferCost from "./CalculateTransferCost.js";

export default class BalanceOperation {
  constructor(grid) {
    let average = this.CalculateAverage(grid);
    this.lowerBound = average * 0.9;
    this.upperBound = average * 1.1;
    this.startState = new BalanceShipState(
      grid,
      0,
      1,
      null,
      0,
      this.BalanceHeuristic(grid, this.lowerBound, this.upperBound),
      ""
    );
    this.frontier = new PriorityQueue();
    this.visitedStates = new Set();
    this.operationList = [];
    this.gridList = [];
    this.goalState = undefined;
    this.balanceMode = true;
  }
  // Calculate the average of the total weight
  CalculateAverage(grid) {
    let sum = 0.0;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        sum += grid[i][j].weight;
      }
    }
    return sum / 2;
  }
  CreateLists(goalState) {
    let currState = goalState;
    if (currState == this.startState) {
      if (this.balanceMode) {
        this.operationList.unshift("The ship is already balanced!");
      } else {
        this.operationList.unshift(
          "The ship is already in SIFT configuration!"
        );
      }
    }
    if (goalState.craneX != 0 && goalState.craneY != 1) {
      this.operationList.unshift(
        "Move crane back to starting location at (1, 9)"
      );
    }
    while (currState.parent != null) {
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
  // Balance heuristic function to guess the cost from a goal state
  BalanceHeuristic(grid, lowerBound, upperBound) {
    lowerBound = Math.ceil(lowerBound);
    upperBound = Math.floor(upperBound);
    let leftItemVect = [];
    let rightItemVect = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length / 2; j++) {
        if (grid[i][j].name !== "UNUSED" && grid[i][j].name !== "NAN") {
          leftItemVect.push([grid[i][j].weight, 6 - j]);
        }
      }
    }
    for (let i = 0; i < grid.length; i++) {
      for (let j = grid[0].length / 2; j < grid[0].length; j++) {
        if (grid[i][j].name !== "UNUSED" && grid[i][j].name !== "NAN") {
          rightItemVect.push([grid[i][j].weight, j - 5]);
        }
      }
    }
    let DPVect = [];
    for (let i = 0; i <= upperBound; i++) {
      DPVect[i] = [0, 0, 0];
    }
    for (let i = 0; i < leftItemVect.length; i++) {
      for (let j = upperBound; j >= 0; j--) {
        // Check if current upper bound is greater than or equal to the item's weight
        if (j >= leftItemVect[i][0]) {
          // Check if adding the current container results in a weight to be closer to the max, if true then add it instead
          if (
            DPVect[j][0] <
            DPVect[j - leftItemVect[i][0]][0] + leftItemVect[i][0]
          ) {
            DPVect[j][0] =
              DPVect[j - leftItemVect[i][0]][0] + leftItemVect[i][0];
            DPVect[j][1] = DPVect[j - leftItemVect[i][0]][1];
          }
          // Otherwise move this container to the right
          else {
            DPVect[j][1] = DPVect[j][1] + leftItemVect[i][1];
          }
        }
        // If not then automatically do not include this container on the left side (add the cost of moving the container to the right)
        else {
          DPVect[j][1] = DPVect[j][1] + leftItemVect[i][1];
        }
      }
    }
    for (let i = 0; i < rightItemVect.length; i++) {
      for (let j = upperBound; j >= 0; j--) {
        if (j >= rightItemVect[i][0]) {
          // Check if adding the current container results in a weight to be closer to the max, if true then add it instead
          if (
            DPVect[j][0] <
            DPVect[j - rightItemVect[i][0]][0] + rightItemVect[i][0]
          ) {
            DPVect[j][0] =
              DPVect[j - rightItemVect[i][0]][0] + rightItemVect[i][0];
            DPVect[j][1] =
              DPVect[j - rightItemVect[i][0]][1] + rightItemVect[i][1];
          }
        }
      }
    }
    let minVal = Number.MAX_SAFE_INTEGER;
    for (let i = lowerBound; i <= upperBound; i++) {
      if (DPVect[i][0] >= lowerBound) {
        minVal = Math.min(minVal, DPVect[i][1]);
      }
    }
    return minVal;
  }

  // SIFT heuristic function to guess the cost from a goal state

  SIFTHeuristic(grid) {
    let containers = [];
    let where_each_container_is = new Map(); //Maps container to its current row and column. This is so we don't have to constantly search for them in the grid

    for (let i = 9; i >= 0; --i) {
      //Loop adds containers to containers array and maps each container to its current location
      for (let j = 0; j < 12; ++j) {
        if (grid[i][j].name !== "NAN" && grid[i][j].name !== "UNUSED") {
          containers.push(grid[i][j]);
          where_each_container_is.set(grid[i][j], [i, j]);
        }
      }
    }
    containers.sort((a, b) => b.weight - a.weight); //Biggest to smallest weight

    let duplicates_list = []; //Groups together containers with the same weight
    let j;
    for (let i = 0; i < containers.length; i = j) {
      //Add all containers to duplicates_list, grouping containers weight with the same weight together
      j = i + 1;
      for (
        ;
        j < containers.length && containers[i].weight === containers[j].weight;
        ++j
      ) {}
      duplicates_list.push(containers.slice(i, j));
    }

    let row = 9;
    let left_column = 5;
    let right_column = 6;
    let sift_placements = []; //Stores all the locations containers are allowed to be at for SIFT to be satisfied

    for (let i = 0; i < containers.length; ++i) {
      //Add all locations to sift_placements
      if (
        left_column < 0 ||
        right_column >= 12 ||
        grid[row][left_column].name === "NAN" ||
        grid[row][left_column].name === "NAN"
      ) {
        row--;
        left_column = 5;
        right_column = 6;
      }
      sift_placements.push([row, left_column]);
      left_column--;
      i++;
      if (i < containers.length) {
        sift_placements.push([row, right_column]);
        right_column++;
      }
    }
    let sift_duplicates = []; //Groups all locations together where multiple containers can go
    let cnt = 0;

    for (let i of duplicates_list) {
      //If there are duplicate weights, group together the possible locations they can be moved
      sift_duplicates.push(sift_placements.slice(cnt, cnt + i.length));
      cnt += i.length;
    }

    let total_cost = 0;
    let minimum_cost;
    let current_cost;
    let costs_array = [];

    for (let i = 0; i < duplicates_list.length; ++i) {
      //Minimum cost is computed by finding the minimum distance out of all duplicate containers to multiple possible locations times the number of duplicates
      minimum_cost = Number.MAX_SAFE_INTEGER;
      for (let j of duplicates_list[i]) {
        costs_array.push([]);
        for (let k of sift_duplicates[i]) {
          current_cost = CalculateTransferCost(
            [
              "SHIP",
              where_each_container_is.get(j)[0],
              where_each_container_is.get(j)[1],
            ],
            ["SHIP", k[0], k[1]]
          );
          if (current_cost < minimum_cost) {
            minimum_cost = current_cost;
          }
          costs_array[costs_array.length - 1].push(current_cost);
        }
      }
      total_cost += minimum_cost * duplicates_list[i].length;
    }

    let is_goal_state = true;
    for (let i of costs_array) {
      if (!i.includes(0)) {
        is_goal_state = false;
      }
    }
    return [total_cost, is_goal_state];
  }
  // Operation function that expands the given balance state
  ExpandBalanceState(state) {
    for (let i = 0; i < state.width; i++) {
      let originalY = state.topContainer[i];
      if (
        !(i === state.craneX && originalY === state.craneY) &&
        originalY < 10 &&
        state.grid[originalY][i].name !== "NAN"
      ) {
        for (let j = 0; j < state.width; j++) {
          let finalY = state.topContainer[j] - 1;
          if (j !== i && finalY >= 0) {
            let newGrid = [];
            for (let k = 0; k < state.height; k++) {
              newGrid[k] = [];
              for (let l = 0; l < state.width; l++) {
                newGrid[k][l] = state.grid[k][l];
              }
            }
            let temp = newGrid[finalY][j];
            newGrid[finalY][j] = newGrid[originalY][i];
            newGrid[originalY][i] = temp;
            let key = "";
            for (let k = 0; k < newGrid.length; k++) {
              for (let l = 0; l < newGrid[k].length; l++) {
                key += newGrid[k][l].name;
              }
            }
            if (!this.visitedStates.has(key)) {
              let currCost = this.CalculateCost(
                state.craneX,
                state.craneY,
                i,
                j,
                state.topContainer
              );
              let newState = new BalanceShipState(
                newGrid,
                j,
                finalY,
                state,
                state.gCost + currCost,
                this.BalanceHeuristic(
                  newGrid,
                  this.lowerBound,
                  this.upperBound
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
              this.visitedStates.add(key);
            }
          }
        }
      }
    }
  }
  // Operation function that expands the given SIFT state
  ExpandSIFTState(state) {
    for (let i = 0; i < state.width; i++) {
      let originalY = state.topContainer[i];
      if (
        !(i === state.craneX && originalY === state.craneY) &&
        originalY < 10 &&
        state.grid[originalY][i].name !== "NAN"
      ) {
        for (let j = 0; j < state.width; j++) {
          let finalY = state.topContainer[j] - 1;
          if (j !== i && finalY >= 0) {
            let newGrid = [];
            for (let k = 0; k < state.height; k++) {
              newGrid[k] = [];
              for (let l = 0; l < state.width; l++) {
                newGrid[k][l] = state.grid[k][l];
              }
            }
            let temp = newGrid[finalY][j];
            newGrid[finalY][j] = newGrid[originalY][i];
            newGrid[originalY][i] = temp;
            let key = "";
            for (let k = 0; k < newGrid.length; k++) {
              for (let l = 0; l < newGrid[k].length; l++) {
                key += newGrid[k][l].name;
              }
            }
            if (!this.visitedStates.has(key)) {
              let currCost = this.CalculateCost(
                state.craneX,
                state.craneY,
                i,
                j,
                state.topContainer
              );
              let newState = new BalanceShipState(
                newGrid,
                j,
                finalY,
                state,
                state.gCost +
                  this.CalculateCost(
                    state.craneX,
                    state.craneY,
                    i,
                    j,
                    state.topContainer
                  ),
                this.SIFTHeuristic(newGrid)[0],
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
              this.visitedStates.add(key);
            }
          }
        }
      }
    }
  }
  // Balance A* search with frontier and map for visited states
  BalanceOperationSearch() {
    if (this.startState.hCost === Number.MAX_SAFE_INTEGER) {
      console.log("Impossible to be balanced, executing SIFT.");
      this.SIFTOperationSearch();
    } else {
      this.frontier.add(this.startState);
      this.visitedStates.add(this.startState.grid);
      while (this.frontier.heap.length > 0) {
        let currState = this.frontier.remove();
        if (currState.hCost === 0) {
          this.CreateLists(currState);
          this.goalState = currState;
          break;
        }
        this.ExpandBalanceState(currState);
      }
    }
  }
  // SIFT A* search for frontier and map for visited states
  // Currently has no heuristic so appears to take too long to test
  SIFTOperationSearch() {
    this.balanceMode = false;
    this.sortedContainers = this.startState.grid
      .flat()
      .filter(
        (container) => container.name !== "NAN" && container.name !== "UNUSED"
      )
      .sort((a, b) => b.weight - a.weight);
    this.frontier.add(this.startState);
    this.visitedStates.add(this.startState.grid);
    while (this.frontier.heap.length > 0) {
      let currState = this.frontier.remove();
      if (this.SIFTHeuristic(currState.grid)[1]) {
        this.CreateLists(currState);
        this.goalState = currState;
        break;
      }
      this.ExpandSIFTState(currState);
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

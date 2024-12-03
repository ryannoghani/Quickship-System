const BalanceShipState = require("./BalanceShipState");
const CalculateTransferCost = require("./HelperFunctions/CalculateTransferCost")

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
        while (this.hasParent(index) && this.comparePriority(this.parent(index), this.heap[index]) > 0) {
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
        return (state1.gCost + state1.hCost) - (state2.gCost + state2.hCost);
    }
}

class BalanceOperation {
    constructor(grid) {
        this.startState = new BalanceShipState(grid, 0, 1, null, 0, this.BalanceHeuristic(grid), "");
        this.frontier = new PriorityQueue();
        this.visitedStates = new Set();
        this.operationList = [];
        this.gridList = [];
        let average = this.CalculateAverage();
        this.lowerBound = average * 0.9;
        this.upperBound = average * 1.1;
        this.goalState;
    }
    // Calculate the average of the total weight
    CalculateAverage() {
        let sum = 0.0;
        for(let i = 0; i < this.startState.height; i++) {
            for(let j = 0; j < this.startState.width; j++) {
                sum += this.startState.grid[i][j].weight;
            }
        }
        return sum / 2;
    }
    // Calculate total cost of an operation
    CalculateCost(craneX, craneY, boxStartCol, boxEndCol, topContainers) {
        return this.CostCranetoBox(craneX, craneY, boxStartCol, topContainers) + this.CostBoxtoBox(boxStartCol, boxEndCol, topContainers);
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
            for(let i = boxStartCol + 1; i <= (boxEndCol - 1); i++) {
                movementUp = Math.max(movementUp, (9 - topContainers[i]) - startHeight);
            }
        }
        else {
            for(let i = boxStartCol - 1; i >= (boxEndCol + 1); i--) {
                movementUp = Math.max(movementUp, (9 - topContainers[i]) - startHeight);
            }
        }
        movementUp += 1;
        let cost = 0; 
        cost += movementUp;
        cost += Math.abs(boxEndCol - boxStartCol);
        cost += Math.abs((endHeight + 1) - (startHeight + movementUp));
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
            for(let i = craneX + 1; i <= (boxCol - 1); i++) {
                movementUp = Math.max(movementUp, (9 - topContainers[i]) - craneHeight);
            }
        }
        else {
            for(let i = craneX - 1; i >= (boxCol + 1); i--) {
                movementUp = Math.max(movementUp, (9 - topContainers[i]) - craneHeight);
            }
        }
        movementUp++;
        cost += movementUp;
        cost += Math.abs(craneX - boxCol);
        cost += Math.abs((boxHeight + 1) - (craneHeight + movementUp));
        cost++;
        return cost;
    }
    // Balance heuristic function to guess the cost from a goal state
    BalanceHeuristic(grid) {
        return 0;
    }
    // SIFT heuristic function to guess the cost from a goal state
    SIFTHeuristic(grid) {
        var containersSortedByWeight = []

        for (let i = 9; i >= 0; --i) {
            for (let j = 0; j < 12; ++j) {
                if (grid[i][j].name != "NAN" && grid[i][j].name != 'UNUSED') {
                    containersSortedByWeight.push(grid[i][j])
                }
            }
        }

        containersSortedByWeight.sort((a, b) => b.weight - a.weight);
        var where_each_container_needs_to_go = new Map()    //Maps container to a row and column
        var row = 9
        var left_column  = 5
        var right_column  = 6
    
        for (let i = 0; i < containersSortedByWeight.length;) {//First we'll find where each container needs to go
            if (grid[row][left_column] == "NAN" || grid[row][right_column] == "NAN" || left_column < 0 || right_column >= 12) {
                row++
                left_column = 5
                right_column = 6
            }
            else {
                where_each_container_needs_to_go.set(containersSortedByWeight[i], [row, left_column])
                ++i
                
                if (i == containersSortedByWeight.length) {
                    break
                }
                else {
                    where_each_container_needs_to_go.set(containersSortedByWeight[i], [row, right_column])
                    ++i
                }
    
                left_column--
                right_column++
            }
        }
    
        var cost = 0
        //Now we calculate how far each container is currently from where it's supposed to go after sift
        for (let i = 9; i >= 0; --i) {
            for (let j = 0; j < 12; ++j) {
                if (grid[i][j].name != "NAN" && grid[i][j].name != 'UNUSED') {
                    cost += CalculateTransferCost(["SHIP", i,j], ["SHIP", where_each_container_needs_to_go.get(grid[i][j])[0], where_each_container_needs_to_go.get(grid[i][j])[1]])   
                }
            }
        }
        return cost
    }
    // Creates an array for the list of operations and the list of grids
    CreateLists(goalState) {
        let currState = goalState;
        while(currState.parent != null) {
            this.operationList.unshift(currState.operation);
            this.gridList.unshift(currState.grid);
            currState = currState.parent;
        }
    }
    // Checks if the given state is a balance goal state
    CheckBalanceGoalState(state) {
        let balanced = state.leftHalfWeight <= this.upperBound && state.leftHalfWeight >= this.lowerBound;
        let validSlots = true;
        for(let i = 0; i < 2 && validSlots; i++) {
            for(let j = 0; j < state.width && validSlots; j++) {
                if(state.grid[i][j].name != "UNUSED") {
                    validSlots = false;
                }
            }
        }
        return balanced && validSlots;
    }
    // Operation function that expands the given balance state
    ExpandBalanceState(state) {
        for(let i = 0; i < state.width; i++) {
            let originalY = state.topContainer[i];
            if(!(i == state.craneX && originalY == state.craneY) && originalY < 10 && state.grid[originalY][i].name != "NAN") {
                for(let j = 0; j < state.width; j++) {
                    let finalY = state.topContainer[j] - 1;
                    if(j != i && finalY >= 0) {
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
                        let key = "";
                        for(let k = 0; k < newGrid.length; k++) {
                            for(let l = 0; l < newGrid[k].length; l++) {
                                key += newGrid[k][l].name;
                            }
                        }
                        if(!this.visitedStates.has(key)) {
                            let newState = new BalanceShipState(newGrid, j, finalY, state, state.gCost + this.CalculateCost(state.craneX, state.craneY, i, j, state.topContainer), this.BalanceHeuristic(newGrid), "Move container at (" + i + ", " + originalY + ") to (" + j + ", " + finalY + ").")
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
        for(let i = 0; i < state.width; i++) {
            let originalY = state.topContainer[i];
            if(!(i == state.craneX && originalY == state.craneY) && originalY < 10 && state.grid[originalY][i].name != "NAN") {
                for(let j = 0; j < state.width; j++) {
                    let finalY = state.topContainer[j] - 1;
                    if(j != i && finalY >= 0) {
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
                        let key = "";
                        for(let k = 0; k < newGrid.length; k++) {
                            for(let l = 0; l < newGrid[k].length; l++) {
                                key += newGrid[k][l].name;
                            }
                        }
                        if(!this.visitedStates.has(key)) {
                            let newState = new BalanceShipState(newGrid, j, finalY, state, state.gCost + this.CalculateCost(state.craneX, state.craneY, i, j, state.topContainer), this.SIFTHeuristic(newGrid), "Move container at (" + i + ", " + originalY + ") to (" + j + ", " + finalY + ").")
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
        if(this.startState.BalanceHeuristic == -1) {
            this.SIFTOperationSearch();
        }
        else {
            this.frontier.add(this.startState);
            this.visitedStates.add(this.startState.grid);
            while(this.frontier.heap.length > 0) {
                let currState = this.frontier.remove();
                if(this.CheckBalanceGoalState(currState)) {
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
        this.sortedContainers = this.startState.grid.flat().filter(container => container.name !== "NAN" && container.name !== "UNUSED").sort((a, b) => b.weight - a.weight);
        this.frontier.add(this.startState);
        this.visitedStates.add(this.startState.grid);
        while(this.frontier.heap.length > 0) {
            let currState = this.frontier.remove();
            if(this.SIFTHeuristic(currState.grid) == 0) {
                this.CreateLists(currState);
                this.goalState = currState;
                break;
            }
            this.ExpandSIFTState(currState);
        }
    }
}

module.exports = BalanceOperation;
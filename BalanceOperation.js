const BalanceShipState = require("./BalanceShipState");

// https://www.geeksforgeeks.org/implementation-priority-queue-javascript/
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
        this.startState = new BalanceShipState(grid, 1, 1, null, 0, this.Heuristic(grid), "");
        this.frontier = new PriorityQueue();
        this.visitedStates = new Set();
        this.operationList = [];
        this.gridList = [];
        let average = this.CalculateAverage();
        this.lowerBound = average * 0.9;
        this.upperBound = average * 1.1;
        this.goalState;
    }
    CalculateAverage() {
        let sum = 0.0;
        for(let i = 0; i < this.startState.height; i++) {
            for(let j = 0; j < this.startState.width; j++) {
                sum += this.startState.grid[i][j].weight;
            }
        }
        return sum / 2;
    }
    CalculateCost(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    Heuristic(grid) {
        return 0;
    }
    CreateOperationList(goalState) {
        let currState = goalState;
        while(currState.parent != null) {
            this.operationList.unshift(currState.operation);
            this.gridList.unshift(currState.grid);
            currState = currState.parent;
        }
    }
    CheckGoalState(state) {
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
    ExpandState(state) {
        for(let i = 0; i < state.width; i++) {
            let originalY = state.topContainer[i];
            if(i != state.craneX && originalY < 10 && state.grid[originalY][i].name != "NAN") {
                for(let j = 0; j < state.width; j++) {
                    let finalY = state.topContainer[j] - 1;
                    console.log(state.grid[originalY][i]);
                    if(j != i && finalY >= 0) {
                        console.log("(" + i + ", " + originalY + ") to (" + j + ", " + finalY + ")");
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
                            let newState = new BalanceShipState(newGrid, j, finalY, state, state.gCost + this.CalculateCost(i, originalY, j, finalY), this.Heuristic(newGrid), "Move container at (" + i + ", " + originalY + ") to (" + j + ", " + finalY + ").")
                            this.frontier.add(newState);
                            this.visitedStates.add(key);
                        }
                        else {
                            console.log("Visited");
                        }
                    }
                }
            }
        }
    }
    BalanceOperationSearch() {
        this.frontier.add(this.startState);
        this.visitedStates.add(this.startState.grid);
        while(this.frontier.heap.length > 0) {
            let currState = this.frontier.remove();

            if(this.CheckGoalState(currState)) {
                this.CreateOperationList(currState);
                this.goalState = currState;
                console.log(this.goalState.grid);
                break;
            }

            this.ExpandState(currState);
        }
    }
}

module.exports = BalanceOperation;
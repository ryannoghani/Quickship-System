class NameCost {
    constructor(name, cost) {
        this.name = name;
        this.cost = cost; 
    }
}

// https://www.geeksforgeeks.org/implementation-priority-queue-javascript/
// slightly adjusted priority queue implementation to use my object NameCost instead of states for A* frontiers
class PriorityQueueNameCost {
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
    comparePriority(item1, item2) {
        return item1.cost - item2.cost;
    }
}

let containersIn = ["STATER BROS", "AMAZON"];
let numContOutMap = new Map();
numContOutMap.set("WALMART", 2);
numContOutMap.set("TARGET", 1);
numContOutMap.set("RALPHS", 2);

let grid = [

    ["UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "RAND", "RAND"],
    ["UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "RAND", "RAND"],
    ["UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED"],
    ["UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED"],
    ["UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "RAND", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED"],
    ["RAND", "RAND", "UNUSED", "RAND", "UNUSED", "RAND", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED"],
    ["NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED"],
    ["NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "RALPHS"],
    ["NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "RALPHS", "UNUSED", "TARGET", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "UNUSED", "WALMART", "WALMART"],
    ["NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "NAN", "RALPHS", "UNUSED", "TARGET", "UNUSED", "UNUSED", "WALMART", "UNUSED", "UNUSED", "WALMART", "UNUSED", "WALMART", "WALMART"],
];

// start of function
let cost  = 0;
let currContainerName = "";
let numContainersToRemove = 0;
for (const value of numContOutMap.values()) { // figure out total amount of containers to remove
    numContainersToRemove += value;
}

cost += 3 * (containersIn.length); // cost for containers still to be loaded. 2 from truck to pink right, 1 to get into valid ship slot
console.log("Cost after loading containers: " + cost + "\n");

// cost for containers still in buffer.
for (let i = 0; i < 24; i++) { // left to right
    for (let j = 5; j >= 0; j--) { // down to up
        //currContainerName = grid[j][i].name;
        currContainerName = grid[j][i];
        if (currContainerName === "UNUSED") { // if you reached an unused square there are no containers above, skip to next column
            break;
        }
        else if (currContainerName !== "NAN") {
            cost += (Math.abs(1 - j) + Math.abs(23 - i) + 5); // manhattan distance to pink left. 4 to pink right. 1 to valid ship slot
        }
    }
}
console.log("Cost after emptying buffer: " + cost + "\n");

for (let i = 27; i < 39; i++) {
    for (let j = 1; j >= 0; j--) {
        //currContainerName = grid[j][i].name;
        currContainerName = grid[j][i];
        if (currContainerName === "UNUSED") {
            break;
        }
        if (currContainerName !== "NAN" && !numContOutMap.has(currContainerName)) {
            cost += (j === 0) ? 2 : 1; // 2 if on second row above, 1 if on first row above
        }
    }
}
console.log("Cost after clearing above row 8 on ship: " + cost + "\n");

if (numContainersToRemove > 0) {
        // find cost to unload each containers that has a name matching those in numContOutMap
    let minHeap = new PriorityQueueNameCost();
    for (let i = 0 + 27; i < 12 + 27; i++) { // left to right
        for (let j = 9; j >= 2; j--) { // down to up
            //currContainerName = grid[j][i].name;
            currContainerName = grid[j][i];
            if (currContainerName === "UNUSED") {
                break;
            }
            if(numContOutMap.has(currContainerName)) { // current container has the name of one to be taken out
                minHeap.add(new NameCost(currContainerName, Math.abs(1 - j) + Math.abs(27 - i) + 6)); //manhattan distance to right pink square + 6 (4 to left pink sqaure and 2 to truck)
            }
        }
    }

    console.log(numContOutMap);
    console.log(minHeap);

    let containersRemoved = 0;
    // pick only the most efficient containers to take out, out of all containers with matching names
    while (containersRemoved < numContainersToRemove) {
        currContainerName = minHeap.peek().name; // name of smallest cost item
        if (numContOutMap.get(currContainerName) > 0) { // is there still containers of that name needed to be taken out
            console.log("Need " + minHeap.peek().name + ". Adding cost. New total is " + (cost + minHeap.peek().cost));
            cost += minHeap.remove().cost;
            numContOutMap.set(currContainerName, numContOutMap.get(currContainerName) - 1);
            containersRemoved++;
        }
        else {
            console.log("Dont need " + minHeap.peek().name + ". Removing from minheap");
            minHeap.remove();
        }
        console.log(numContOutMap);
        console.log(minHeap);
    }
}

console.log("cost after unloading containers: " + cost);
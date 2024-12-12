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

function numGridCont(grid) {
    let cnt = 0;
    let currContainerName = "";
    for (let i = 0; i < 24; i++) { // left to right
        for (let j = 5; j >= 0; j--) { // down to up
            currContainerName = grid[j][i].name;
            if (currContainerName === "UNUSED") { // if you reached an unused square there are no containers above, skip to next column
                break;
            }
            else if (currContainerName !== "NAN") {
                cnt++;
            }
        }
    }
    return cnt;
}

export default function heuristic (containersIn, containersOut, grid) {
    let cost  = 0;

    cost += 7 * (containersIn.length); // cost for containers still to be loaded. 2 from truck to pink left, 4 from pink left to pink right, 1 to get into valid ship slot
    cost += 5 * (numGridCont(grid)); // cost for containers still in buffer. 4 from pink left to pink right, 1 into valid ship slot

    let numContOutMap = new Map(); //maps how many containers of a specific name to take out
    for (let i = 0; i < containersOut.length; i++) {
        if (numContOutMap.has(containersOut[i])) { //if already in map, increment
            numContOutMap.set(containersOut[i], numContOutMap.get(containersOut[i]) + 1);
        }
        else { //new map item
            numContOutMap.set(containersOut[i], 1);
        }
    }

    let currContainerName;

    // find cost of moving all non unloadable containers above row 8 back into ship
    for (let i = 0 + 27; i < 12 + 27; i++) {
        for (let j = 1; j >= 0; j--) {
            currContainerName = grid[j][i].name;
            if (currContainerName === "UNUSED") {
                break;
            }
            if (currContainerName !== "NAN" && !numContOutMap.has(currContainerName)) {
                cost += (j === 0) ? 2 : 1; // 2 if on second row above, 1 if on first row above
            }
        }
    }

    if (containersOut.length > 0) { // if there are no containers to take out, no need to search for them
        // find cost to unload each containers that has a name matching those in containersOut
        let minHeap = new PriorityQueueNameCost();
        for (let i = 0 + 27; i < 12 + 27; i++) { // left to right
            for (let j = 9; j >= 2; j--) { // down to up
                currContainerName = grid[j][i].name;
                if (currContainerName === "UNUSED") {
                    break;
                }
                if(numContOutMap.has(currContainerName)) { // current container has the name of one to be taken out
                    minHeap.add(new NameCost(currContainerName, Math.abs(1 - j) + Math.abs(27 - i) + 6)); //manhattan distance to right pink square + 6 (4 to left pink sqaure and 2 to truck)
                }
            }
        }
    
        let containersRemoved = 0;
        // pick only the most efficient containers to take out, out of all containers with matching names
        while (containersRemoved < containersOut.length) {
            currContainerName = minHeap.peek().name; // name of smallest cost item
            if (numContOutMap.get(currContainerName) > 0) { // is there still containers of that name needed to be taken out
                cost += minHeap.remove().cost;
                numContOutMap.set(currContainerName, numContOutMap.get(currContainerName) - 1);
                containersRemoved++;
            }
            else {
                minHeap.remove();
            }
        }
    }

    return cost;
}

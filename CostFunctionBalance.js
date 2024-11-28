function MovementCost(craneX, craneY, boxStartCol, boxEndCol, topContainers) {
    return CostCranetoBox(craneX, craneY, boxStartCol, topContainers) + CostBoxtoBox(boxStartCol, boxEndCol, topContainers);
}

// calculates cost to move container to a specific location
function CostBoxtoBox(boxStartCol, boxEndCol, topContainers) {

    //the container is already in correct location
    if (boxStartCol === boxEndCol) {
        return 0;
    }

    //there is no container at startcol
    if (topContainers[boxStartCol] > 9) {
        return 9999
    }

    //figure out if starting column is on left or ride of end column;
    let startIsLeft = true;
    if (boxStartCol > boxEndCol) {
        startIsLeft = false;
    }

    let startHeight = 9 - topContainers[boxStartCol];
    let endHeight = 9 - topContainers[boxEndCol];
    
    //figure out how much the container has to go up in order to clear all containers between the two spots
    let movementUp = -1;
    if (startIsLeft) {
        for (let i = boxStartCol + 1; i <= (boxEndCol - 1); i++) {
            movementUp = Math.max(movementUp, (9 - topContainers[i]) - startHeight);
        }
    }
    else {
        for (let i = boxStartCol - 1; i >= (boxEndCol + 1); i--) {
            movementUp = Math.max(movementUp, (9 - topContainers[i]) - startHeight);
        }
    }
    movementUp += 1;

    let cost = 0; 
    cost += movementUp; //cost to go up 
    cost += Math.abs(boxEndCol - boxStartCol); //cost to move to correct column
    cost += Math.abs((endHeight + 1) - (startHeight + movementUp)); //cost to move up/down to go spot 1 above target container
    return cost;
}

//calculates cost to move crane to container
function CostCranetoBox(craneX, craneY, boxCol, topContainers) {

    //crane is already at the box
    if (craneX === boxCol && craneY === topContainers[boxCol]) {
        return 0;
    }

    //no box for crane to grab or crane is somehow underneath container
    if (topContainers[boxCol] > 9 || craneY > topContainers[craneX]) {
        return 9999;
    }

    let cost = 0;

    //if crane is currently attached to container move up 1 to remove it
    if (craneY === topContainers[craneX]) {
        cost++;
        craneY--;
    }

    
    //figure out if crane is on left or right side
    let craneIsLeft = true;
    if (craneX > boxCol) {
        craneIsLeft = false;
    }

    let craneHeight = 9 - craneY;
    let boxHeight = 9 - topContainers[boxCol];

    //figure out how much the crane must move up in order to travel to correct column
    let movementUp = -1;
    if (craneIsLeft) {
        for (let i = craneX + 1; i <= (boxCol - 1); i++) {
            movementUp = Math.max(movementUp, (9 - topContainers[i]) - craneHeight);
        }
    }
    else {
        for (let i = craneX - 1; i >= (boxCol + 1); i--) {
            movementUp = Math.max(movementUp, (9 - topContainers[i]) - craneHeight);
        }
    }
    movementUp++;

    cost += movementUp; //cost to go up
    cost += Math.abs(craneX - boxCol); //cost to move to correct column
    cost += Math.abs((boxHeight + 1) - (craneHeight + movementUp)); //cost to move up/down to go spot 1 above target container
    cost++; //cost to move down 1 to target container to grab it

    return cost;
}

module.exports = {MovementCost, CostBoxtoBox, CostCranetoBox};
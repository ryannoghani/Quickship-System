export function CostBalance(startColumn, endColumn, topContainers) {

    if (startColumn === endColumn) {
        return 0;
    }

    //figure out which column is on the left and right;
    let left = Math.min(startColumn, endColumn);
    let right = endColumn;
    if (left === endColumn) {
        right = startColumn;
    }
    
    let up = -1;
    //figure out how much the container has to go up in order to clear all containers between the two spots
    for (let i = left + 1; i < right - 1; i++) {
        up = Math.max(up, topContainers[i] - topContainers[left]);
    }
    up += 1;

    let cost = 0;
    cost = up + (right - left) + Math.abs((topContainers[right]) - (topContainers[left] + up)) - 1;
    
    // console.log('up = ' + up);
    // console.log('right - left = ' + (right - left));
    // console.log('abs toprihgt - topleft+up = ' + (Math.abs((topContainers[right]) - (topContainers[left] + up))));
    // console.log('cost = ' + cost);

    return cost;
}
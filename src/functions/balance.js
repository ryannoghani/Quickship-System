import { matrix } from "mathjs";
import { Heap } from "heap-js";
export default function balanceManifest(start) {
  const comparator = (a, b) => Promise.resolve(a[0] - b[0]);
  const minheap = new Heap(comparator);

  //The priority value for a state represents the estimated length for a path from start to goal that contains the state.
  //The 0 value is technically incorrect but should be inconsequential as its the only state starting in the heap.
  minheap.init([0, start]);

  //Prev tracks the best preceding state for
  let prev = {};
  prev[start] = null;

  //The shortest length path found so far for a state
  let running_cost = {};
  running_cost[start] = 0;

  let goal = null;

  while (!minheap.isEmpty()) {
    const curr = minheap.pop();

    if (is_balanced(curr)) {
      goal = curr;
      break;
    }

    const nbrs = neighbors(curr);

    nbrs.forEach((neighbor) => {
      const nbr_cost = running_cost[curr] + cost(curr, neighbor);

      //If this neighbor has been unexplored or we have discovered a shorter path to reach it
      if (
        running_cost[neighbor] === undefined ||
        nbr_cost < running_cost[neighbor]
      ) {
        running_cost[neighbor] = nbr_cost;

        //We can precisely calculate exactly how much it costs to reach this state, but we must estimate the remainder
        //with the heuristic.
        const priority = running_cost[neighbor] + heuristic(neighbor);
        minheap.push([priority, neighbor]);
        prev[neighbor] = curr;
      }
    });
  }

  if (goal === null) {
    return null;
  }

  let path = [goal];
  let state = goal;
  while (state !== start) {
    path.push(prev[state]);
    state = prev[state];
  }

  path.push(start);

  return path.reverse();
}

function is_balanced(manifest) {
  const totalwt = manifest.flat().reduce((a, b) => {
    return a + b;
  });

  const low = Math.ceil(totalwt * 0.45); //integer division or float?
  const high = Math.floor(totalwt * 0.55);

  let left = [];
  let right = [];

  manifest.forEach((row) => {
    const mid = Math.floor(row.length / 2);
    left.push(row.slice(0, mid));
    right.push(row.slice(mid));
  });

  left = left.flat();
  right = right.flat();

  const leftwt = left.reduce((a, b) => a + b);
  const rightwt = right.reduce((a, b) => a + b);

  return leftwt >= low && rightwt <= high;
}

function heuristic(manifest) {
  const weights = manifest.reduce((a, b) => {
    return a.concat(b);
  });
  const totalwt = weights.reduce((a, b) => a + b);

  const low = Math.ceil((totalwt / 2) * 0.95); //integer division or float?
  const high = Math.ceil((totalwt / 2) * 1.05);

  const dp = Array(high + 1).fill(Infinity);
  const track = Array(high + 1).fill(-1);

  dp[0] = 0;

  for (let i = 0; i < weights.length; i++) {
    for (let sum = high; i >= weights[i]; sum--) {
      if (dp[sum - weights[i]] + 1 < dp[sum]) {
        dp[sum] = dp[sum - weights[i]] + 1;
        track[sum] = i;
      }
    }
  }

  let minElements = Infinity;
  let bestSum = -1;

  for (let sum = low; sum <= high; sum++) {
    if (dp[sum] !== Infinity && dp[sum] < minElements) {
      minElements = dp[sum];
      bestSum = sum;
    }
  }

  if (bestSum === -1) {
    return -1;
  }

  const subset = [];
  while (bestSum > 0) {
    const index = track[bestSum];
    subset.push(weights[index]);
    bestSum -= weights[index];
  }

  return subset;
}

function neighbors(manifest) {
  let neighbors = [];
  const width = manifest[0].length;

  //Calculate a list of row values that represents the available spot on each column.
  const available = new Array(width).fill(0);
  for (let row of manifest) {
    row.forEach((col, i) => {
      if (col != 0) {
        available[i] += 1;
      }
    });
  }
}

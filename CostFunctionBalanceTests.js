import { CostBalance } from "./CostFunctionBalance.js";

console.log('Test 1a');
console.assert(CostBalance(5, 9, [4, -1, 7, 3, 0, 5, 6, 2, 1, 3, -1, 7]) === 9);

console.log('Test 1b');
console.assert(CostBalance(9, 5, [4, -1, 7, 3, 0, 5, 6, 2, 1, 3, -1, 7]) === 9);

console.log('Test 2a');
console.assert(CostBalance(0, 11, [6, 1, 2, 7, 0, 5, -1, 4, 3, 2, 1, 6]) === 14);

console.log('Test 2b');
console.assert(CostBalance(11, 0, [6, 1, 2, 7, 0, 5, -1, 4, 3, 2, 1, 6]) === 14);

console.log('Test 3a');
console.assert(CostBalance(3, 8, [3, 7, 2, -1, 0, 4, 6, 1, 5, 2, 0, -1]) === 14);

console.log('Test 3b');
console.assert(CostBalance(8, 3, [3, 7, 2, -1, 0, 4, 6, 1, 5, 2, 0, -1]) === 14);

console.log('Test 4a');
console.assert(CostBalance(6, 10, [2, 3, -1, 5, 7, 4, 6, 0, 1, 2, 3, 5]) === 6);

console.log('Test 4b');
console.assert(CostBalance(10, 6, [2, 3, -1, 5, 7, 4, 6, 0, 1, 2, 3, 5]) === 6);

console.log('Test 5a');
console.assert(CostBalance(2, 7, [5, 0, 6, 4, -1, 7, 3, 2, 1, 7, 0, 5]) === 12);

console.log('Test 5b');
console.assert(CostBalance(7, 2, [5, 0, 6, 4, -1, 7, 3, 2, 1, 7, 0, 5]) === 12);

console.log('Test 6a');
console.assert(CostBalance(4, 9, [1, 5, 2, 6, -1, 4, 3, 7, 0, 1, 2, -1]) === 20);

console.log('Test 6b');
console.assert(CostBalance(9, 4, [1, 5, 2, 6, -1, 4, 3, 7, 0, 1, 2, -1]) === 20);

console.log('Test 7');
console.assert(CostBalance(0, 0, [4, -1, 7, 3, 0, 5, 6, 2, 1, 3, -1, 7]) === 0);

console.log('Test 8');
console.assert(CostBalance(11, 11, [6, 1, 2, 7, 0, 5, -1, 4, 3, 2, 1, 6]) === 0);

console.log('Test 9');
console.assert(CostBalance(1, 2, [3, 7, 2, -1, 0, 4, 6, 1, 5, 2, 0, -1]) === 5);

console.log('Test 10');
console.assert(CostBalance(2, 1, [2, 3, -1, 5, 7, 4, 6, 0, 1, 2, 3, 5]) === 4);
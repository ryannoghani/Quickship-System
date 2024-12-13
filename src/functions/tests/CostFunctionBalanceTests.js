const {MovementCost ,CostBoxtoBox, CostCranetoBox} = require('./CostFunctionBalance');

//CostBox2Box tests
console.log('TestSuite: CostBoxtoBox, Test: 1a (regular)');
console.assert(CostBoxtoBox(4, 9, [3, 7, 1, 10, 6, 0, 4, 9, 8, 2, 5, 7]) === 14);

console.log('TestSuite: CostBoxtoBox, Test: 1b (regular)');
console.assert(CostBoxtoBox(9, 4, [3, 7, 1, 10, 6, 0, 4, 9, 8, 2, 5, 7]) === 14);

console.log('TestSuite: CostBoxtoBox, Test: 2a (regular)');
console.assert(CostBoxtoBox(0, 11, [0, 10, 5, 3, 8, 7, 10, 1, 6, 9, 2, 4]) === 14);

console.log('TestSuite: CostBoxtoBox, Test: 2b (regular)');
console.assert(CostBoxtoBox(11, 0, [0, 10, 5, 3, 8, 7, 10, 1, 6, 9, 2, 4]) === 16);

console.log('TestSuite: CostBoxtoBox, Test: 3 (columns right next to each other)');
console.assert(CostBoxtoBox(4, 5, [2, 8, 0, 5, 9, 10, 6, 3, 10, 1, 4, 7]) === 1);

console.log('TestSuite: CostBoxtoBox, Test: 3 (no box in startcol)');
console.assert(CostBoxtoBox(5, 4, [2, 8, 0, 5, 9, 10, 6, 3, 10, 1, 4, 7]) === 9999);

console.log('TestSuite: CostBoxtoBox, Test: 4 (same column)');
console.assert(CostBoxtoBox(8, 8, [9, 1, 4, 6, 0, 10, 10, 3, 5, 2, 7, 8]) === 0);

//CostCrane2Box tests
console.log('TestSuite: CostCranetoBox, Test: 1 (regular, crane not attached to box)');
console.assert(CostCranetoBox(8, 4, 4, [3, 7, 1, 10, 6, 0, 4, 9, 8, 2, 5, 7]) === 16);

console.log('TestSuite: CostCranetoBox, Test: 2 (regular, crane not attached to box)');
console.assert(CostCranetoBox(3, 1, 8, [0, 10, 5, 3, 8, 7, 2, 1, 6, 9, 4, 10]) === 12);

console.log('TestSuite: CostCranetoBox, Test: 3 (regular, crane attached to box)');
console.assert(CostCranetoBox(0, 2, 11, [2, 8, 0, 5, 9, 10, 6, 3, 10, 1, 4, 7]) === 22);

console.log('TestSuite: CostCranetoBox, Test: 4 (regular, crane attached to box`)');
console.assert(CostCranetoBox(10, 8, 0, [9, 1, 4, 6, 0, 10, 7, 3, 5, 2, 8, 10]) === 29);

console.log('TestSuite: CostCranetoBox, Test: 5 (columns right next to each other)');
console.assert(CostCranetoBox(3, 0, 2, [7, 3, 6, 2, 9, 0, 10, 5, 1, 8, 4, 10]) === 7);

console.log('TestSuite: CostCranetoBox, Test: 6 (columns right next to each other)');
console.assert(CostCranetoBox(4, 4, 5, [5, 8, 1, 10, 4, 7, 3, 9, 2, 6, 0, 10]) === 6);

console.log('TestSuite: CostCranetoBox, Test: 7a (same column, not attached)');
console.assert(CostCranetoBox(0, 0, 0, [7, 2, 9, 5, 10, 3, 8, 6, 1, 4, 0, 7]) === 7);

console.log('TestSuite: CostCranetoBox, Test: 7b (same column, attached)');
console.assert(CostCranetoBox(0, 7, 0, [7, 2, 9, 5, 10, 3, 8, 6, 1, 4, 0, 7]) === 0);

//MovementCost tests
console.log('TestSuite: MovementCost, Test: 1');
console.assert(MovementCost(6, 1, 10, 0, [4, 9, 1, 7, 3, 5, 10, 0, 2, 8, 6, 10]) === 34);

console.log('TestSuite: MovementCost, Test: 2');
console.assert(MovementCost(3, 1, 5, 4, [2, 8, 6, 1, 10, 3, 0, 5, 7, 4, 9, 3]) === 13);

console.log('TestSuite: MovementCost, Test: 3');
console.assert(MovementCost(11, 9, 1, 11, [5, 0, 9, 2, 7, 10, 3, 8, 4, 1, 6, 10]) === 40);

console.log('TestSuite: MovementCost, Test: 4');
console.assert(MovementCost(0, 0, 6, 7, [6, 4, 10, 1, 8, 3, 7, 2, 9, 0, 5, 6]) === 20);

console.log('TestSuite: MovementCost, Test: 5');
console.assert(MovementCost(0, 0, 0, 1, [10, 3, 7, 0, 9, 5, 1, 4, 8, 6, 2, 10]) >= 9999);
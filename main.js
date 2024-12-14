import ManifestGridTranslator from "./ManifestGridTranslator.js";
import LoadUnloadOperation from "./LoadUnloadOperation.js";
import Container from "./Container.js";
import fs from "fs";

let testManifestGridTranslator = new ManifestGridTranslator();
const manifestString = fs.readFileSync("Manifests/SilverQueen.txt", "utf8");
let grid = testManifestGridTranslator.ConvertManifestToGrid(manifestString);
let buffer_ship_grid = [];
for (let i = 0; i < 10; ++i) {
    buffer_ship_grid[i] = [];
    for (let j = 0; j < 39; ++j) {
        buffer_ship_grid[i][j] = new Container();
    }
}
for (let i = 0; i < 10; ++i) {
    for (let j = 0; j < 12; ++j) {
        buffer_ship_grid[i][j+27] = grid[i][j];
    }
}
for (let i = 6; i < 10; ++i) {
    for (let j = 0; j < 24; ++j) {
        buffer_ship_grid[i][j].name = 'NAN';
        buffer_ship_grid[i][j].weight = 0;
    }
}
for (let j = 0; j < 27; ++j) {
    buffer_ship_grid[0][j].weight = 0;
}
for (let i = 2; i < 10; ++i) {
    for (let j = 24; j < 27; ++j) {
        buffer_ship_grid[i][j].name = 'NAN';
        buffer_ship_grid[i][j].weight = 0;
    }
}

let cat = new Container();
cat.name = 'Cat';
let bat = new Container();
bat.name = 'Bat';
let rat = new Container();
rat.name = 'Rat';
let cow = new Container();
cow.name = 'Cow';
let nat = new Container();
nat.name = 'Nat';
let doe = new Container();
doe.name = 'Doe';
let hen = new Container();
hen.name = 'Hen';
let pig = new Container();
pig.name = 'Pig';
let natron = new Container();
natron.name = 'Natron';
let batons = new Container();
batons.name = 'Batons';
let catfish = new Container();
catfish.name = 'Catfish';
let loadList = [natron];
let unloadList = [batons, catfish];
let testLoadUnloadOperation = new LoadUnloadOperation(buffer_ship_grid, loadList, unloadList);
testLoadUnloadOperation.LoadUnloadOperationSearch();
if(testLoadUnloadOperation.goalState != null) {
    // console.log(testLoadUnloadOperation.shipGridList);
    // console.log(testLoadUnloadOperation.containerList);
    console.log(testLoadUnloadOperation.operationList);
    console.log("Estimated total cost: " + testLoadUnloadOperation.goalState.gCost);
}
else {
    console.log("Found no solution");
}

/* ShipCase1: 20 minutes
    'Move crane to (1, 2) in the ship and unload container (Estimate 20 minutes)'
    'Move crane back to starting location at (9, 1)'
*/

/* ShipCase2: 9 minutes
    'Move crane to truck and move container to (4, 1) in the ship (Estimate 9 minutes)'
    'Move crane back to starting location at (9, 1)'
*/

/* ShipCase3: 37 minutes
    'Move crane to truck and move container to (3, 1) in the ship (Estimate 10 minutes)'
    'Move crane to (2, 2) in the ship and move container to (2, 3) in the ship (Estimate 5 minutes)'
    'Move crane to (1, 2) in the ship and unload container (Estimate 15 minutes)'
    'Move crane to truck and move container to (4, 1) in the ship (Estimate 7 minutes)'
    'Move crane back to starting location at (9, 1)'
*/

/* ShipCase4: 36 minutes
    'Move crane to (8, 5) in the ship and move container to (2, 6) in the ship (Estimate 12 minutes)'
    'Move crane to (7, 5) in the ship and unload container (Estimate 16 minutes)'
    'Move crane to truck and move container to (3, 1) in the ship (Estimate 8 minutes)'
    'Move crane back to starting location at (9, 1)'
*/

/* ShipCase5: 60 minutes
    'Move crane to truck and move container to (2, 1) in the ship (Estimate 11 minutes)'
    'Move crane to (1, 5) in the ship and unload container (Estimate 21 minutes)'
    'Move crane to truck and move container to (2, 3) in the ship (Estimate 11 minutes)'
    'Move crane to (1, 4) in the ship and unload container (Estimate 17 minutes)'
    'Move crane back to starting location at (9, 1)'
*/

/* SilverQueen: 50 minutes
    'Move crane to (2, 2) in the ship and move container to (2, 3) in the ship (Estimate 9 minutes)',
    'Move crane to (1, 4) in the ship and unload container (Estimate 17 minutes)',
    'Move crane to truck and move container to (2, 1) in the ship (Estimate 9 minutes)',
    'Move crane to (1, 2) in the ship and unload container (Estimate 15 minutes)',
    'Move crane back to starting location at (9, 1)'
*/
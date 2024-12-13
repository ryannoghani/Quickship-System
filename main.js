import ManifestGridTranslator from "./ManifestGridTranslator.js";
import LoadUnloadOperation from "./LoadUnloadOperation.js";
import Container from "./Container.js";
import fs from "fs";

let testManifestGridTranslator = new ManifestGridTranslator();
const manifestString = fs.readFileSync("Manifests/ShipCase5.txt", "utf8");   //Stores the file into a string
let grid = testManifestGridTranslator.ConvertManifestToGrid(manifestString);

let buffer_ship_grid = [] //This will eventually become a 10 row, 39 column 2d array

for (let i = 0; i < 10; ++i) {
    buffer_ship_grid[i] = []
    for (let j = 0; j < 39; ++j) {
    buffer_ship_grid[i][j] = new Container(); //For now, every slot on the buffer_ship_grid is set to UNUSED, but we will change this in the upcoming lines
    }
}

for (let i = 0; i < 10; ++i) {  //This is basically pasting over the grid onto the right half of buffer_ship_grid
    for (let j = 0; j < 12; ++j) {
    buffer_ship_grid[i][j+27] = grid[i][j]
    }
}

for (let i = 6; i < 10; ++i) { //Technically, the buffer is only 5 rows, not 10. So for its lower 5 rows, we set each slot to NAN so that containers are never moved there during the search
    for (let j = 0; j < 24; ++j) {
    buffer_ship_grid[i][j].name = 'NAN'
    buffer_ship_grid[i][j].weight = 0   //It should never be the case that the weight isnt already 0, but I put this here just in case
    }
}

for (let j = 0; j < 27; ++j) {  //For now, lets assume the operator can move containers to the same row as the left pink virtual cell. This means the whole row should be intialized to UNUSED, so future containers may move there
    buffer_ship_grid[0][j].name = 'UNUSED'
    buffer_ship_grid[0][j].weight = 0
}

for (let i = 2; i < 10; ++i) {  //The area below our bridge should never be accessed either. The bridge is at row index 1, by the way
    for (let j = 24; j < 27; ++j) {
    buffer_ship_grid[i][j].name = 'NAN'
    buffer_ship_grid[i][j].weight = 0
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
let loadList = [nat, rat];
let unloadList = [hen, pig];
let testLoadUnloadOperation = new LoadUnloadOperation(buffer_ship_grid, loadList, unloadList);
testLoadUnloadOperation.LoadUnloadOperationSearch();
if(testLoadUnloadOperation.goalState != null) {
    console.log(testLoadUnloadOperation.operationList);
}
else {
    console.log("Found no solution");
}
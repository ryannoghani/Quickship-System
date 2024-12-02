const ManifestGridTranslator = require("./ManifestGridTranslator");
const LoadUnloadOperation = require("./LoadUnloadOperation");

let testManifestGridTranslator = new ManifestGridTranslator();
let grid = testManifestGridTranslator.ConvertManifestToGrid("Manifests/ShipCase5.txt");
let testLoadUnloadOperation = new LoadUnloadOperation(grid);
testLoadUnloadOperation.SIFTOperationSearch();
if(testLoadUnloadOperation.goalState != null) {
    console.log("\nThe total cost for this balance is " + testLoadUnloadOperation.goalState.gCost + ".\n");
    for(let i = 0; i < testLoadUnloadOperation.operationList.length; i++) {
        console.log("Step " + (i + 1) + ": " + testLoadUnloadOperation.operationList[i]);
    }
}
else {
    console.log("Found no solution");
}
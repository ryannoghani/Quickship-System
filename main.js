const ManifestGridTranslator = require("./ManifestGridTranslator");
const BalanceOperation = require("./BalanceOperation");

let testManifestGridTranslator = new ManifestGridTranslator();
let grid = testManifestGridTranslator.ConvertManifestToGrid("Manifests/ShipCase1.txt");
let testBalanceOperation = new BalanceOperation(grid);
testBalanceOperation.BalanceOperationSearch();
if(testBalanceOperation.goalState != null) {
    console.log("\nThe total cost for this balance is " + testBalanceOperation.goalState.gCost + ".\n");
    for(let i = 0; i < testBalanceOperation.operationList.length; i++) {
        console.log("Step " + (i + 1) + ": " + testBalanceOperation.operationList[i]);
    }
}
else {
    console.log("Found no solution");
}
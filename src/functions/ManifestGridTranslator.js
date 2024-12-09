import Container from "./Container";

export default class ManifestGridTranslator {
  ConvertManifestToGrid(manifestFileName) {
    //Initialize grid of containers
    let grid = [];
    for (let i = 0; i < 10; i++) {
      grid[i] = [];
      for (let j = 0; j < 12; j++) {
        grid[i][j] = new Container();
      }
    }
    //Opening up file to read
    var fs = require("fs");
    const manifestString = fs.readFileSync(manifestFileName, "utf8"); //Stores the file into a string
    var index = 1;
    var indexOfNewline;
    var weight;
    var name;

    for (
      var i = 9;
      i >= 2;
      --i //This loops through various parts of the string to extract the weight and name of each container
    ) {
      for (var j = 0; j < 12; ++j) {
        index += 9;
        weight = parseInt(manifestString.substring(index, index + 6)); //Takes substring, converts to integer
        grid[i][j].weight = weight;
        index += 8;
        indexOfNewline = index;
        while (
          manifestString.substring(indexOfNewline, indexOfNewline + 1) !==
            "\n" &&
          indexOfNewline < manifestString.length
        ) {
          //Finds index of newline character, which indicates when the name has ended
          indexOfNewline++;
        }
        if (manifestString[indexOfNewline - 1] === "\r") {
          name = manifestString.substring(index, indexOfNewline - 1);
        } else {
          name = manifestString.substring(index, indexOfNewline);
        }

        grid[i][j].name = name;
        index = indexOfNewline + 2;
      }
    }
    return grid;
  }

  ConvertGridToManifest(
    manifestFileName,
    grid //UPDATES MANIFEST BASED ON CONTENTS OF GRID
  ) {
    var line = "";
    var row;
    var column;
    for (let i = 9; i >= 2; i--) {
      for (let j = 0; j < 12; j++) {
        row = "0" + (-1 * (i - 9) + 1);
        if (j + 1 < 10) {
          column = "0" + (j + 1);
        } else {
          column = j + 1;
        }
        line += "[" + row + "," + column + "], {";

        if (grid[i][j].weight === 0) {
          line += "0000";
        } else {
          for (
            let k = 1;
            k <= 5 - (Math.floor(Math.log10(grid[i][j].weight)) + 1);
            ++k
          ) {
            line += "0";
          }
        }

        line += grid[i][j].weight + "}, " + grid[i][j].name;
        if (i > 2 || j < 11) {
          line += "\n";
        }
      }
    }
    var fs = require("fs");
    fs.writeFileSync(manifestFileName, line);
  }
}

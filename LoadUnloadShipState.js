export default class LoadUnloadShipState {
  constructor(_grid, _craneX, _craneY, _parent, _gCost, _hCost, _operation, _unloadMap, _loadList, _key, _bufferCol, _loadContainer = null) {
    this.width = _grid[0].length;
    this.height = _grid.length;
    this.grid = _grid;
    this.topContainer = [];
    this.craneX = _craneX;
    this.craneY = _craneY;
    this.parent = _parent;
    this.gCost = _gCost;
    this.hCost = _hCost;
    this.operation = _operation;
    this.unloadMap = _unloadMap;
    this.loadList = _loadList;
    this.key = _key;
    this.bufferCol = _bufferCol;
    this.loadContainer = _loadContainer;
    this.FindTopContainers();
  }
  FindTopContainers() {
    for (let i = 0; i < this.width; i++) {
      let foundTop = false;
      let j;
      for (j = 0; j < this.height; j++) {
        if (!foundTop && this.grid[j][i].name != "UNUSED") {
          this.topContainer[i] = j;
          foundTop = true;
          break;
        }
      }
      if (!foundTop && j >= this.height) {
        this.topContainer[i] = this.height;
      }
    }
  }
}
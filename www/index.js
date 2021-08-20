// import { rgb } from "color-convert";
import { Universe} from "wasm-game-of-life";
  // Import the WebAssembly memory at the top of the file.
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";


const CELL_SIZE = 5; // px
const GRID_COLOR = "#000000";
const DEAD_COLOR = "#000000";
const DEAD = 0;
// c2 = 0;
// c1 = 0;
// c0 = 0;
// alive = ALIVE_COLOR;

// Construct the universe, and get its width and height.
const universe = Universe.new();
const width = universe.width();
const height = universe.height();
// ALIVE_COLOR = universe.alive_colour;

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const renderLoop = () => {
  universe.tick();

  drawGrid();
  drawCells();

  requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
  // const cellsPtr = universe.cells();
  // const cells = new Uint8Array(memory.buffer, cellsPtr, width * height + 3);

    ctx.beginPath();
    // red = cells[width * height]
    // green = cells[width * height+1]
    // blue = cells[width * height+2]
    



    ctx.strokeStyle = GRID_COLOR; // rgb(red,green,blue);

    // ctx.strokeStyle =cells[width * height].toString(16)
  
    // Vertical lines.
    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }
  
    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
      ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }
  
    ctx.stroke();

    
  };



// ...

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height + 3);
  let rgb_str = 'rgb(' + 255 + ',' + 255 + ',' + 255 + ')';

  
  
  // red = cells[width * height]
  // green = cells[width * height+1]
  // blue = cells[width * height+2]
  
  ctx.font = "30px Arial";



  ctx.beginPath();

  // ctx.fillStyle = rgb(cells[width * height])

  // ctx.fillText(cells[width * height].toString(16) +'-'
  // + cells[width * height + 1].toString(16) + '-'
  // + cells[width * height + 2].toString(16) , 10, 50);

  // console.log('rgb(' + cells[width * height] + ',' + cells[width * height + 1] + ',' + cells[width * height + 2] + ')')
  rgb_str = 'rgb(' + cells[width * height] + ',' + cells[width * height + 1] + ',' + cells[width * height + 2] + ')';
  // console.log(rgb_str);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);


      // ctx.fillStyle = ALIVE_COLOR // alive
      ctx.fillStyle = cells[idx] === DEAD
        ? DEAD_COLOR // universe.bg_colour() //DEAD_COLOR
        :  rgb_str;  // 'rgb(' + cells[width * height] + ',' + cells[width * height + 1] + ',' + cells[width * height + 2] + ')'; //universe.fg_colour(); //ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();

};

drawGrid();
drawCells();
requestAnimationFrame(renderLoop);
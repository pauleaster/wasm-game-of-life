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

var tick_count = document.getElementById("tick_count");
let tick_value = tick_count.value;

tick_count.oninput = function() {
  tick_value = this.value;
}

const fps = new class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    // Save only the latest 100 timings.
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }
    let mean = sum / this.frames.length;

    // Render the statistics.
    this.fps.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
};


const ctx = canvas.getContext('2d');

let animationId = null;

const renderLoop = () => {

  fps.render();

  drawGrid();
  drawCells();

  for (let i = 0; i < 9; i++) {
    universe.tick();
  }

  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId); 
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

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

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);

  drawGrid();
  drawCells();
});

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height + 3);
  let rgb_str = 'rgb(' + 0 + ',' + 255 + ',' + 255 + ')';

  
  
  let red = cells[width * height]
  let green = cells[width * height+1]
  let blue = cells[width * height+2]
  
  ctx.font = "30px Courier";



  ctx.beginPath();

 

  // console.log('rgb(' + cells[width * height] + ',' + cells[width * height + 1] + ',' + cells[width * height + 2] + ')')
  rgb_str = 'rgb(' + cells[width * height] + ',' + cells[width * height + 1] + ',' + cells[width * height + 2] + ')';
  // console.log(rgb_str);

  // ALIVE_COLOR = rgb_str
  // DEAD_COLOR 

  ctx.fillStyle = DEAD_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] != DEAD) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );

      // // ctx.fillStyle = ALIVE_COLOR // alive
      // ctx.fillStyle = cells[idx] === DEAD
      //   ? DEAD_COLOR // universe.bg_colour() //DEAD_COLOR
      //   :  rgb_str;  // 'rgb(' + cells[width * height] + ',' + cells[width * height + 1] + ',' + cells[width * height + 2] + ')'; //universe.fg_colour(); //ALIVE_COLOR;

      
    }
  }

  ctx.fillStyle = rgb_str;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] == DEAD) {
        continue;
      }
      // ctx.fillStyle == rgb_str;

      // // ctx.fillStyle = ALIVE_COLOR // alive
      // ctx.fillStyle = cells[idx] === DEAD
      //   ? DEAD_COLOR // universe.bg_colour() //DEAD_COLOR
      //   :  rgb_str;  // 'rgb(' + cells[width * height] + ',' + cells[width * height + 1] + ',' + cells[width * height + 2] + ')'; //universe.fg_colour(); //ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }



  rgb_str = 'rgb(' + 255 + ',' + 255 + ',' + 255 + ')';
  ctx.fillStyle = rgb_str //rgb(cells[width * height])

  ctx.fillText(('0' + cells[width * height].toString(16)).slice(-2) +':'
  + ('0' + cells[width * height + 1].toString(16)).slice(-2) + ':'
  + ('0' + cells[width * height + 2].toString(16)).slice(-2) + ' ' + tick_value.toString(), 10, 50);
  ctx.stroke();

};

drawGrid();
drawCells();
// requestAnimationFrame(renderLoop);

play();
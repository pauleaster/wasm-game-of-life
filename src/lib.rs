mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// #[wasm_bindgen]
// #[repr(u8)]
// #[derive(Clone, Copy, Debug, PartialEq, Eq)]
// pub enum Cell {
//     Dead = 0,
//     Alive = 1,
// }




#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<u8>,
    fg_colour: u32,
    bg_colour: u32,
    colour_status: u32,
}

const ALIVE: u8 = 1;
const DEAD: u8 = 0;

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    fn increment_colour(& mut self) {

        match self.colour_status {
            0 => { self.fg_colour = self.fg_colour + 0x000100;
                if  self.fg_colour >= 0xFFFF00 {
                    self.colour_status = 1;
                    self.fg_colour = 0xFFFF00;
                    }
                },
            1 => { self.fg_colour = self.fg_colour - 0x010000;
                if  self.fg_colour <= 0x00FF00 {
                    self.colour_status = 2;
                    self.fg_colour = 0x00FF00;
                    }
                },
            2 => { self.fg_colour = self.fg_colour + 0x000001;
                if  self.fg_colour >= 0x00FFFF {
                    self.colour_status = 3;
                    self.fg_colour = 0x00FFFF;
                    }
                },
            3 => { self.fg_colour = self.fg_colour - 0x000100;
                if  self.fg_colour <= 0x0000FF {
                    self.colour_status = 4;
                    self.fg_colour = 0x0000FF;
                    }
                },
            4 => { self.fg_colour = self.fg_colour + 0x010000;
                if  self.fg_colour >= 0xFF00FF {
                    self.colour_status = 5;
                    self.fg_colour = 0xFF00FF;
                    }
                },
            5 => { self.fg_colour = self.fg_colour - 0x000001;
                if  self.fg_colour <= 0xFF0000 {
                    self.colour_status = 0;
                    self.fg_colour = 0xFF0000;
                    }
                },
             _  => {
                self.fg_colour = 0xFF0000;
                self.colour_status = 0;
            }
        }

    }
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();


        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                let next_cell = match (cell, live_neighbors) {
                    // Rule 1: Any live cell with fewer than two live neighbours
                    // dies, as if caused by underpopulation.
                    (ALIVE, x) if x < 2 => DEAD,
                    // Rule 2: Any live cell with two or three live neighbours
                    // lives on to the next generation.
                    (ALIVE, 2) | (ALIVE, 3) => ALIVE,
                    // Rule 3: Any live cell with more than three live
                    // neighbours dies, as if by overpopulation.
                    (ALIVE, x) if x > 3 => DEAD,
                    // Rule 4: Any dead cell with exactly three live neighbours
                    // becomes a live cell, as if by reproduction.
                    (DEAD, 3) => ALIVE,
                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise,
                };

                next[idx] = next_cell;
            }
        }

        self.cells = next;
        self.increment_colour();
        self.cells[(self.height  * self.width) as usize] =  ((self.fg_colour >> 16) | 0x0FF) as u8;
        self.cells[(self.height  * self.width+1) as usize] =  ((self.fg_colour >> 8) | 0x0FF) as u8;
        self.cells[(self.height  * self.width+2) as usize] =  (self.fg_colour  | 0x0FF) as u8
        

    }
    
    pub fn new() -> Universe {
        let width = 128;
        let height = 128;
        let fg_colour:u32 = 0xFF0000;
        let bg_colour: u32 = 0x00FF00;
        let colour_status = 0;


        let cells: Vec<u8> = (0..width * height + 3)
            .map(|i| {
                if i < width * height {
                    if i % 2 == 0 || i % 7 == 0 {
                        ALIVE
                    } else {
                        DEAD
                    }
                } else if i == width * height {
                    ((fg_colour >> 16) | 0x0FF) as u8
                } else if i == width * height + 1 {
                    ((fg_colour >> 8) | 0x0FF) as u8
                } else {
                    (fg_colour  | 0x0FF) as u8
                }
            })
            .collect();


        Universe {
            width,
            height,
            cells,
            fg_colour,
            bg_colour,
            colour_status,

        }
    }

    // pub fn render(&self) -> String {
    //     self.to_string()
    // }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u8 {
        self.cells.as_ptr()
    }
    
    pub fn fg_colour(&self) -> u32 {
        self.fg_colour
    }

    pub fn bg_colour(&self) -> u32 {
        self.bg_colour
    }





}




// use std::fmt;

// impl fmt::Display for Universe {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         for line in self.cells.as_slice().chunks(self.width as usize) {
//             for &cell in line {
//                 let symbol = if cell == DEAD { '◻' } else { '◼' };
//                 write!(f, "{}", symbol)?;
//             }
//             write!(f, "\n")?;
//         }

//         Ok(())
//     }
// }
    

const { Jimp } = require("jimp");
const path = require("path");
const fs = require("fs");

const trackDir = path.join(__dirname, "public", "game-assets", "track");

const GRID = [
  ["tile_0_2", "tile_0_1", "tile_0_1", "tile_2_1", "tile_0_1", "tile_0_2"], // Row 0
  ["tile_0_1", null,       null,       null,       null,       "tile_0_1"], // Row 1
  ["tile_2_2", null,       null,       null,       null,       "tile_0_1"], // Row 2
  ["tile_0_2", "tile_2_0", "tile_0_1", "tile_1_0", "tile_0_1", "tile_0_2"]  // Row 3
];

const GRID_ROTATIONS = [
  [90, 90, 90, 90, 90, 180],
  [0,  0,  0,  0,  0,  0  ],
  [0,  0,  0,  0,  0,  0  ],
  [0,  90, 90, 90, 90, 270]
];

async function main() {
  try {
    console.log("Initializing blank track background (1536x1024)...");
    
    // Create new transparent image
    const background = new Jimp({
      width: 1536,
      height: 1024,
      color: 0x00000000 // transparent
    });

    const tileW = 256;
    const tileH = 256;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const tileName = GRID[r][c];
        if (!tileName) continue;

        const tilePath = path.join(trackDir, `${tileName}.png`);
        if (!fs.existsSync(tilePath)) {
          console.error(`Tile not found: ${tilePath}`);
          continue;
        }

        console.log(`Adding ${tileName} at row ${r}, col ${c}...`);
        const tile = await Jimp.read(tilePath);
        
        // Rotate tile
        const angle = GRID_ROTATIONS[r][c];
        if (angle !== 0) {
          tile.rotate(angle);
        }

        // Composite onto background
        background.composite(tile, c * tileW, r * tileH);
      }
    }

    const destPath = path.join(trackDir, "track_background.png");
    await background.write(destPath);
    console.log(`Saved merged track background to: ${destPath}`);
  } catch (err) {
    console.error("Error merging track background:", err);
  }
}

main();

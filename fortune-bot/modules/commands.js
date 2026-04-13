import fs from "node:fs/promises";
import pkg from 'svg-path-parser';
const { parseSVG, makeAbsolute } = pkg;
import { curveInterpolator } from './interpolator.js';

export function getSvgCommands(paths) {
  let commands = [];
  
  paths.forEach(path => {
    const decompressSVG = new parseSVG(path);
    const absoluteSVG = makeAbsolute(decompressSVG);
    absoluteSVG.forEach(command => {
      Object.entries(command).map(([key, value]) => {
        if (typeof value === 'number') {
          command[key] = Math.round(value);
        }
        if (['command', 'relative'].includes(key)) {
          delete command[key];
        }
      })
    })
    commands = absoluteSVG;
  });

  return commands;
}

export async function appendData(data) {
  try {
    const current = await fs.readFile('alphabet.json', 'utf-8');
    const parsedCurrent = JSON.parse(current);
    parsedCurrent.push(data);
    await fs.writeFile('alphabet.json', JSON.stringify(parsedCurrent, null, 2));
    console.log('Data appended successfully');
  } catch (err) {
    console.error('Error appending data:', err);
  }
}

export function readData(letter, alphabet) {
    // create point array
    const points = [];
    
    // parse to JSON
    const parsed = JSON.parse(alphabet);

    // search by key for letter
    const svgData = parsed.find((data) => data.name == letter);

    // get commands
    svgData.commands.forEach((command, i) => {
        // if command is M, take x and y values and append to point array
        if (command.code == 'M') {
            points.push([command.x, command.y])
        }
        // if command is C, feed in values into interpolator, then append to point array
        if (command.code == 'C') {
            const interpPoints = curveInterpolator([[command.x0, command.y0], [command.x1, command.y1], [command.x2, command.y2], [command.x, command.y]], 2);
            points.push(...interpPoints);
        }

        // if command is S, recover mirror value from last point, then operate as if C
        if (command.code == 'S') {
            const prev = svgData.commands[i - 1];
            const mirrorX = command.x0 + command.x0 - prev.x2;
            const mirrorY = command.y0 + command.y0 - prev.y2;
            const interpPoints = curveInterpolator([[command.x0, command.y0], [mirrorX, mirrorY], [command.x2, command.y2], [command.x, command.y]], 2);
            points.push(...interpPoints);
        }
    });    
        
    // return array of points
    return points;
}

export function writeData(points, offsetX, offsetY, scale) {
    const gCode = [];
    points.forEach((point, index) => {
        const adjustedX = (point[0] * scale) + offsetX;
        const adjustedY = (point[1] * scale) + offsetY;

        if ( index < (points.length - 2)  ) {
            // lift up pen at end
            if ( points[index + 1] == points[index + 2] ) {
                gCode.push( "G01 X" + adjustedX + " Y" + adjustedY + " Z0");
                gCode.push( "G01 X" + adjustedX + " Y" + adjustedY + " Z1000");
                // logging
                console.log("Coord:" + point[0] + "," + point[1]);
                console.log("G01 X" + adjustedX + " Y" + adjustedY + " Z0");
                console.log("G01 X" + adjustedX + " Y" + adjustedY + " Z1000");
                return;
            }
        }
        gCode.push( "G01 X" + adjustedX + " Y" + adjustedY + " Z0" );
        // logging
        console.log("G01 X" + adjustedX + " Y" + adjustedY + " Z0");
        console.log("Coord:" + point[0] + "," + point[1]);
    });
    return gCode;
}


const test = [
  "G01 X900 Y300 Z0",
  "G01 X900 Y-300 Z0",
  "G01 X900 Y-300 Z1000",

  "G01 X1200 Y300 Z0",
  "G01 X1200 Y-300 Z0",
  "G01 X1200 Y-300 Z1000",

  "G01 X900 Y0 Z0",
  "G01 X1200 Y0 Z0",
  "G01 X1200 Y0 Z1000",

  "G01 X1500 Y150 Z0",
  "G01 X1500 Y-300 Z0",
  "G01 X1500 Y-300 Z1000",

  "G01 X1500 Y250 Z0",
  "G01 X1500 Y300 Z0",
  "G01 X1500 Y300 Z1000"
];
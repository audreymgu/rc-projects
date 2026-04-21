import fs from "node:fs/promises";
import { curveInterpolator } from "./interpolator.js";

export function readLetter(letter, alphabet) {
  // create point array
  const points = [];

  // parse to JSON
  const parsed = JSON.parse(alphabet);

  // search by key for letter
  const svgData = parsed.find((data) => data.name == letter);

  // get height
  const width = svgData.params[0];

  // get commands
  svgData.commands.forEach((command, i) => {
    // if command is M, take x and y values and append to point array
    if (command.code == "M") {
      // proxy for lift-up
      points.push([-1, -1]);
      points.push([command.x, command.y]);
    }
    // if command is C, feed in values into interpolator, then append to point array
    if (command.code == "C") {
      const interpPoints = curveInterpolator(
        [
          [command.x0, command.y0],
          [command.x1, command.y1],
          [command.x2, command.y2],
          [command.x, command.y],
        ],
        2,
      );
      points.push(...interpPoints);
    }

    // if command is S, get mirror control point based on last point, then operate as if C
    if (command.code == "S") {
      const prev = svgData.commands[i - 1];
      let mirrorX;
      let mirrorY;

      // handle either if curve or M
      if (prev.x2 && prev.y2) {
        mirrorX = command.x0 + command.x0 - prev.x2;
        mirrorY = command.y0 + command.y0 - prev.y2;
      } else {
        mirrorX = prev.x;
        mirrorY = prev.y;
      }

      const interpPoints = curveInterpolator(
        [
          [command.x0, command.y0],
          [mirrorX, mirrorY],
          [command.x2, command.y2],
          [command.x, command.y],
        ],
        2,
      );
      points.push(...interpPoints);
    }
  });

  // mirror and rotate
  const mirrorPoints = points.map((point) => {
    const newPoint = [point[1], point[0]];
    return newPoint;
  });

  // return array of points
  return mirrorPoints;
}

export function writeLetter(points, offsetX, offsetY, scale) {
  const gCode = [];
  points.forEach((point, index) => {
    // offset
    const adjustedX = point[0] * scale + offsetX;
    const adjustedY = point[1] * scale + offsetY;

    if (index < points.length - 2 && index !== 0) {
      // lift pen at end of previous stroke
      if (point[0] === -1 && point[1] === -1) {
        const prev = points[index - 1];
        const adjPrevX = prev[0] * scale + offsetX;
        const adjPrevY = prev[1] * scale + offsetY;
        gCode.push("G01 X" + adjPrevX + " Y" + adjPrevY + " Z1000");
        // logging
        // console.log("Coord:" + point[0] + "," + point[1]);
        // console.log("G01 X" + adjustedX + " Y" + adjustedY + " Z0");
        // console.log("G01 X" + adjustedX + " Y" + adjustedY + " Z1000");
        return;
      }
    }

    gCode.push("G01 X" + adjustedX + " Y" + adjustedY + " Z0");

    // lift pen at end of letter
    if (index === points.length - 1) {
      gCode.push("G01 X" + adjustedX + " Y" + adjustedY + " Z1000");
    }

    // logging
    // console.log("G01 X" + adjustedX + " Y" + adjustedY + " Z0");
    // console.log("Coord:" + point[0] + "," + point[1]);
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
  "G01 X1500 Y300 Z1000",
];

import fs from "node:fs/promises";
import pkg from "svg-path-parser";
const { parseSVG, makeAbsolute } = pkg;

export function getSvgCommands(paths) {
  let commands = [];

  paths.forEach((path) => {
    const decompressSVG = new parseSVG(path);
    const absoluteSVG = makeAbsolute(decompressSVG);
    absoluteSVG.forEach((command) => {
      Object.entries(command).map(([key, value]) => {
        if (typeof value === "number") {
          command[key] = Math.round(value);
        }
        if (["command", "relative"].includes(key)) {
          delete command[key];
        }
      });
    });
    commands.push(...absoluteSVG);
  });

  return commands;
}

export async function appendData(data) {
  try {
    const current = await fs.readFile("alphabet.json", "utf-8");
    const parsedCurrent = JSON.parse(current);
    parsedCurrent.push(data);
    await fs.writeFile("alphabet.json", JSON.stringify(parsedCurrent, null, 2));
    console.log("Data appended successfully");
  } catch (err) {
    console.error("Error appending data:", err);
  }
}

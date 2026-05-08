import { LineusManager } from "./modules/lineus-manager.js";
import { getSvgCommands, appendData } from "./modules/data.js";
import { readLetter, writeLetter } from "./modules/commands.js";
import express from "express";
import fs from "node:fs/promises";
import { read } from "node:fs";

// load data
const alphabet = await fs.readFile("./data/alphabet.json", "utf-8");
const symbols = await fs.readFile("./data/symbols.json", "utf-8");
const messages = await fs.readFile("./data/messages.json", "utf-8");

// serve web utilities
const app = express();
const port = 3000;
app.use(express.static("utils"));
app.use(express.json());
app.listen(port, () => {
  console.log(`utils can be reached on ${port}`);
});

// receive utility commands
app.post(["/hello", "/input", "/reset"], (req, res) => {
  lm.buffer(req.body.commands);
  // HTTP return status, just says "it worked"
  res.sendStatus(200);
});

// handle file uploads
app.post(["/shape"], (req, res) => {
  const commands = getSvgCommands(req.body.data.paths);

  const svgShape = {
    name: req.body.data.name,
    params: req.body.data.params,
    commands,
  };

  appendData(svgShape);
  res.sendStatus(200);
});

// 100px width, 1300px total width, 13 char width
// 200px height (remember this is actually X), 400px reserved height, 2 lines
function printString(string) {
  const commandBuffer = [];
  const letters = string.split("");

  // exceed max available space
  if (letters.length > 26) {
    return;
  }
  const startX = 800;
  const startY = -900;
  const scale = 4;
  for (let i = 0; i < letters.length; i++) {
    const line = Math.floor(i / 13);
    const nextX = 50 * scale * line;
    const nextY = (i % 13) * 25 * scale;
    if (letters[i] === " ") {
      continue;
    } else {
      const letterData = readLetter(letters[i], alphabet);
      const gCode = writeLetter(
        letterData,
        startX + nextX,
        startY + nextY,
        scale,
      );
      commandBuffer.push(...gCode);
    }
  }
  return commandBuffer;
}

// 400px width, 1200px total width (-50 either side), 3 symbols
// 400px height, 400px reserved height, 1 lines
function printSymbol(symbol) {
  const startX = 1200;
  const startY = -500;
  const scale = 4;

  const commandBuffer = [];
  const symbolData = readLetter(symbol, symbols);
  const gCode = writeLetter(symbolData, startX, startY, scale);

  return gCode;
}

const output = printString("stay away from wasps");
const emoji = printSymbol("beedrill");
output.push(...emoji);
// console.log(emoji);

// create LM instance
const lm = new LineusManager();
lm.init();

// pass command buffer
lm.buffer(output);

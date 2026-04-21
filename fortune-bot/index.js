import { LineusManager } from "./modules/lineus-manager.js";
import { getSvgCommands, appendData } from "./modules/data.js";
import { readLetter, writeLetter } from "./modules/commands.js";
import express from "express";
import fs from "node:fs/promises";
import { read } from "node:fs";

// load alphabet
const alphabet = await fs.readFile("alphabet.json", "utf-8");

const app = express();
const port = 3000;

// serve web client
app.use(express.static("public"));
app.use(express.json());

app.listen(port, () => {
  console.log(`fortune-bot listening on port ${port}`);
});

// receive client commands
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

function printString(string, x, y, scale) {
  const letters = string.split("");
  let startX = x;
  let startY = y;
  letters.forEach((letter) => {
    const letterData = readLetter(letter, alphabet);
    const gCode = writeLetter(letterData, startX, startY, scale);
  });
}

const data = readLetter("test", alphabet);
console.log(data);

// const gCodeData = writeLetter(data, 900, -900, 10);
// console.log(gCodeData);

// create LM instance
const lm = new LineusManager();

// run initialization
// lm.init();

// pass command buffer
// lm.buffer(gCodeData);

// setTimeout(() => {console.log('beep')}, 1000);

import { LineusManager } from "./modules/lineus-manager.js";
import express from "express";
import fs from "node:fs/promises";
import pkg from 'svg-path-parser';
const { parseSVG, makeAbsolute } = pkg;

const app = express();
const port = 3000;

// serve web client
app.use(express.static("public"));
app.use(express.json());

app.listen(port, () => {
  console.log(`fortune-bot listening on port ${port}`);
});

// receive client commands
app.post( ['/hello', '/input', '/reset'], (req, res) => {
  // lm.buffer(req.body.commands);
  // HTTP return status, just says "it worked"
  res.sendStatus(200);
})

// handle file uploads
app.post( ['/shape'], (req, res) => {
  req.body.data.paths.forEach(path => {
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
    console.log(absoluteSVG);
  });
  appendData(JSON.stringify(req.body.data));
  res.sendStatus(200);
});

function remapData() {

}

async function appendData(data) {
  try {
    await fs.appendFile('alphabet.json', data);
    console.log('Data appended successfully');
  } catch (err) {
    console.error('Error appending data:', err);
  }
}

// create LM instance
// const lm = new LineusManager();

// pass command buffer
// lm.buffer(commands)

// run initialization
// lm.init();

// setTimeout(() => {console.log('beep')}, 1000);
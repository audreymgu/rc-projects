import { LineusManager } from "./modules/lineus-manager.js";
import { getCommands, appendData } from "./modules/commands.js";
import express from "express";
import fs from "node:fs/promises";

// load alphabet
const alphabet = await fs.readFile('alphabet.json', 'utf-8');

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
  const commands = getCommands(req.body.data.paths);

  const convertedShape = {
    name: req.body.data.name,
    params: req.body.data.params,
    commands,
  }
  appendData(convertedShape);
  res.sendStatus(200);
});

// create LM instance
// const lm = new LineusManager();

// pass command buffer
// lm.buffer(commands)

// run initialization
// lm.init();

// setTimeout(() => {console.log('beep')}, 1000);
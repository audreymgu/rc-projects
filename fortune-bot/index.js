const express = require("express");
const app = express();
const port = 3000;

// serve web client
app.use(express.static("public"));
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// receive client commands
app.post( ['/hello', '/input', '/reset'], (req, res) => {
  lm.buffer(req.body.commands);
  // HTTP return status, just says "it worked"
  res.sendStatus(200);
})

app.post( ['/shape'], (req, res) => {
  console.log(JSON.stringify(req.body));
  appendData(JSON.stringify(req.body));
  res.sendStatus(200);
})

const fs = require('node:fs/promises');

async function appendData(data) {
  try {
    await fs.appendFile('alphabet.json', data);
    console.log('Data appended successfully');
  } catch (err) {
    console.error('Error appending data:', err);
  }
}

const net = require("net");

class LineusManager {
  constructor() {
    this.host = "10.100.2.219";
    this.client = new net.Socket();
    this.socketState = "";
    this.commandBuffer = [];
  }

  init() {
    // connect to line-us
    this.client.connect(1337, this.host, function () {
      console.log("Connected");
    });

    this.client.on("data", (data) => {
      console.log("Received: " + data);

      // poll for messages after successful connection
      // or queue next command after previous success
      if (data.indexOf("hello") == 0 || data.indexOf("ok") == 0) {
        this.socketState = 'ready'
        this.maybeSendMessage()
      }

      // disconnect on error
      if (data.indexOf("error") == 0) {
        console.log("Error in command " + cmdIndex);
        console.log("Disconnecting...");
        client.destroy()
      }
    });
  }

  maybeSendMessage() {
    if(this.commandBuffer.length > 0 && this.socketState == 'ready') {
        let message = this.commandBuffer.pop();
        this.client.write(message + '\x00\n');
    } else {
        // what "this" refers to changes depending on the context, the arrow function binds to where function was called
        setTimeout(() => {this.maybeSendMessage()}, 500);
    }
  }

  buffer(commands) {
    commands.push("G28");
    commands.reverse();
    this.commandBuffer.push(...commands);
  }
}

// create instance
const lm = new LineusManager();

// pass command buffer
// lm.buffer(commands)

// run initialization
lm.init();

// setTimeout(() => {console.log('beep')}, 1000);
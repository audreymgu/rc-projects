// const net = require("net");
import net from "net";

export class LineusManager {
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
        // what "this" refers to changes depending on the context, the arrow function binds "this" to where function was called
        setTimeout(() => {this.maybeSendMessage()}, 500);
    }
  }

  buffer(commands) {
    commands.push("G28");
    commands.reverse();
    this.commandBuffer.push(...commands);
  }
}
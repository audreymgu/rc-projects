var net = require("net");

// line-us address
// TODO: understand how to get local hostname to resolve correctly
var host = "10.100.2.219";

var client = new net.Socket();

// command list
var commands = [
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

// what is the purpose of this index?
// to index how many commands were sent
var cmdIndex = 0;

client.connect(1337, host, function () {
  // log successful connect
  console.log("Connected");
});

client.on("data", function (data) {
  console.log("Received: " + data);

  // use .indexOf() substring to check if last command (or initial connection) was successful
  // then send a new command
  // couldn't you just do "contains" here rather than this index check? isn't the data returned all on one line?
  if (data.indexOf("hello") == 0 || data.indexOf("ok") == 0) {
    // logging
    console.log(
      "Sending command with index " + cmdIndex + ":" + commands[cmdIndex],
    );
    // send command to client
    // what does "null character, new line mean"?
    // it's used to signal the end of a command
    client.write(commands[cmdIndex] + "\x00\n");
    // increment command index AFTER sending command
    cmdIndex++;
    // remember it's zero-based...
    console.log("Next command:" + cmdIndex);
  }

  // disconnect if error is encountered
  if (data.indexOf("error") == 0) {
    console.log("Error in command " + cmdIndex);
    console.log("Disconnecting...");
    client.destroy();
  }

  // reached end of command array
  if (cmdIndex == commands.length) {
    console.log("Finished!");
    client.destroy();
  }
});

client.on("close", function () {
  console.log("Connection closed");
});
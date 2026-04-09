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

const waveCaffinated = [
    "G00 X700 Y500 Z1000",
    "G00 X1000 Y1000 Z1000",
    "G00 X700 Y500 Z1000",
    "G00 X1000 Y1000 Z1000"
];

const wave = [
    "G01 X700 Y500 Z1000",
    "G01 X1000 Y1000 Z1000",
    "G01 X700 Y500 Z1000",
    "G01 X1000 Y1000 Z1000"
];

const chimesB = [
    "G01 X700 Y-1100 Z1000",
    "G01 X1600 Y-1100 Z1000"
]

const chimes = [
    "G01 X700 Y-900 Z1000",
    "G01 X1600 Y-900 Z1000"
]

async function getResponse(type, commands) {
    const response = await fetch( type, { 
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commands }),
    });
    return response;
}

async function checkResponse(response) {
    if (response.ok) {
        console.log("commands sent");
    } else {
        console.log("error sending commands");
        console.log(response);
    }
}

async function sayHello() {
    const response = await getResponse('/hello', wave);
    checkResponse(response);
}

async function playChimes() {
    const response = await getResponse('/input', chimes);
    checkResponse(response);
}

async function sendDrawing() {
    const response = await getResponse('/input', test);
    checkResponse(response);
}

async function resetPosition() {
    const reset = [ "G28" ];
    const response = await getResponse('/reset', reset);
    checkResponse(response);
}
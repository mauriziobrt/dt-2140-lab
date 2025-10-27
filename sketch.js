// Set to > 0 if the DSP is polyphonic
const FAUST_DSP_VOICES = 0;

let dropNode;
let audioContext;

function playFaust(freq, node, audioContext) {
  // console.log("Context state:", audioContext.state);
  if (audioContext.state === 'suspended') {
    audioContext.resume();
    // console.log("Resumed, now:", audioContext.state);
  }
  // playBubbles(freq, node);
  playThunder(node);
}

function playBubbles(freq, node) {
  // console.log(node.getParams()); // See actual parameter names
  console.log("Playing Bubbles!")
  node.setParamValue("/bubble/drop", 1);
  node.setParamValue("/bubble/bubble/freq", freq)
  setTimeout(() => { node.setParamValue("/bubble/drop", 0) }, 10);
}

function playThunder(node) {
  node.setParamValue("/thunder/rumble", 1);
  setTimeout(() => { node.setParamValue("/thunder/rumble", 0) }, 1000);
}

(async () => {
  //=================================================================================
  //Audio init
  //=================================================================================
  const { createFaustNode } = await import("./create-node.js");
  // Create audio context
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioCtx({ latencyHint: 0.00001 });
  audioContext.suspend();
  // const { faustNode: node, dspMeta: { bubblename } } = await createFaustNode(audioContext, "./drop-meta.json", "./drop-module.wasm", "drop", FAUST_DSP_VOICES);
  const { faustNode: node, dspMeta: { bubblename } } = await createFaustNode(audioContext, "./dsp-meta.json", "./dsp-module.wasm", "thunder", FAUST_DSP_VOICES);
  if (!node) throw new Error("Faust DSP not compiled");
  dropNode = node;
  dropNode.connect(audioContext.destination);
  console.log("Audio ready!")
  console.log("Inputs:", dropNode.getNumInputs(), "Outputs:", dropNode.getNumOutputs());
  console.log("Connected:", dropNode.numberOfOutputs);
})();

// function setup() {
//   createCanvas(400, 400);
//   // userStartAudio(); // p5.js function to handle audio context
// }

// function draw() {
//   background(220);
// }

// function mouseClicked() {
//   if (!dropNode || !audioContext) return;
//   playFaust(windowHeight - mouseY, dropNode, audioContext)
// }

//==========================================================================================
// P5.js
//==========================================================================================

let leftMargin = 50; // (50) edit this to change left margin 
let textSiz = 25; // (25)edit this to change text label text size
let gridNum = 15; // (10) edit this to change grid spacing (lower num = larger grid)

let gridSize = 0;

//init only -- edit colours in setup function 
let textCol = 255;
let textAccent = 0;
let targetBgCol = 0;
let bgCol = 0;


//init slider stuff
let sliders = [];
let sliderWidth;
let configLabels = ["shake thresh", "turn axis", "move thresh"];
let threshVals = [0, " ", 0];

//init label stuff
let labels = ["", "Acceleration X", "Acceleration Y", "Acceleration Z", "", "Rotation X", "Rotation Y", "Rotation Z"];
let vals = [];
let stateLabels = ["shaken", "turned", "moved"];
let states = [0, 0, 0];


function setup() {
  createCanvas(windowWidth, windowHeight);
  gridSize = windowWidth / gridNum;


  //init colours here 
  textCol = color(255);
  targetBgCol = color(0);
  textAccent = color(255, 255, 0);
  bgCol = color(0);


  //init sliders
  sliderWidth = width / 4;
  sliders[0] = createSlider(0, 100, 30, 1); //shaker thresh, 0 - 100, default = 30, step = 1
  sliders[0].position(10, 10);
  sliders[0].size(sliderWidth);
  sliders[2] = createSlider(0, 75, 50, 1); //move thresh, 0 - 75, default = 50, step = 1
  sliders[2].position(10, 10);
  sliders[2].size(sliderWidth);
}

function draw() {

  //update realtime vals
  vals[1] = round(accelerationX, 4);
  vals[2] = round(accelerationY, 4);
  vals[3] = round(accelerationZ, 4);
  vals[5] = round(rotationX, 1);
  vals[6] = round(rotationY, 1);
  vals[7] = round(rotationZ, 1);

  threshVals[0] = sliders[0].value();
  threshVals[2] = sliders[2].value();
  setShakeThreshold(threshVals[0]);
  setMoveThreshold(threshVals[2]);


  //grid spacing
  let gridSlot = 0;

  //fade bg col
  if (bgCol != targetBgCol) {
    bgCol = lerpColor(bgCol, targetBgCol, 0.03);
  }

  //set format stuff
  background(bgCol);
  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  fill(textCol);
  textSize(textSiz);


  gridSlot++; //add extra space


  // acc and rotate labels + vals
  for (x = 0; x < labels.length; x++) {
    if (labels[x] != "") {
      text(labels[x] + ' = ' + vals[x], leftMargin, (gridSize * gridSlot));
    }
    gridSlot++;
  }

  gridSlot += 2; //extra spacing 

  //shaken, turned, moved alerts
  for (x = 0; x < states.length; x++) {
    fill(255, max((255 * states[x]), 30));
    textSize(70);
    textAlign(LEFT, CENTER);
    text(stateLabels[x], leftMargin, (gridSize * gridSlot) + (70 * x));

    textSize(textSiz - 5);
    textAlign(RIGHT, CENTER);
    fill(255);
    text(configLabels[x] + ' = ' + threshVals[x], width - 20, (gridSize * gridSlot) + (70 * x) - 20);

    //sliders for shaken and moved 
    if (x != 1) {
      sliders[x].position(width - sliderWidth - 20, (gridSize * gridSlot) + (70 * x));
    }

    gridSlot++;
  }

  //fade alert text
  for (x = 0; x < states.length; x++) {
    if (states[x] > 0.1) {
      states[x] -= 0.01;
    }
  }

}

//eventss

function updateRealtimeVals() {

}

function deviceMoved() {
  bgCol = color(0, 0, 255);
  states[2] = 1;
}

function deviceTurned() {
  threshVals[1] = turnAxis;
  bgCol = color(0, 255, 0);
  states[1] = 1;
}
function deviceShaken() {
  bgCol = color(255, 0, 0);
  states[0] = 1;
  if (!dropNode || !audioContext) return;
  playFaust(windowHeight - mouseY, dropNode, audioContext)
}

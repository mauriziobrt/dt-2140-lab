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

function setup() {
  createCanvas(400, 400);
  // userStartAudio(); // p5.js function to handle audio context
}

function draw() {
  background(220);
}

function mouseClicked() {
  if (!dropNode || !audioContext) return;
  playFaust(windowHeight - mouseY, dropNode, audioContext)
}
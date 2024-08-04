import Webcam from "./camera.js";
import * as tf from "@tensorflow/tfjs"; //used only to initialise the backend. Posenet library is very much outdated unfortunately, and cannot do this via normal setup.
import * as posenet from "@tensorflow-models/posenet";
import { padAndResizeTo } from "@tensorflow-models/posenet/dist/util";

let model, webcam, labelContainer, maxPredictions;

async function init() {
  setInterval(predict, 1000);
  // append/get elements to the DOM
}

// =========================

async function estimatePoseOutputs(sample, posenetModel) {
  const inputResolution = posenetModel.inputResolution;

  const { resized, padding } = padAndResizeTo(sample, inputResolution);

  const { heatmapScores, offsets, displacementFwd, displacementBwd } =
    await posenetModel.baseModel.predict(resized);

  resized.dispose();

  return { heatmapScores, offsets, displacementFwd, displacementBwd, padding };
}

function poseOutputsToAray(
  heatmapScores,
  offsets,
  displacementFwd,
  displacementBwd
) {
  const axis = 2;
  const concat = tf.concat([heatmapScores, offsets], axis);
  const concatArray = concat.dataSync();

  concat.dispose();

  return concatArray;
}

async function estimatePose(sample, posenetModel, flipHorizontal = false) {
  const { heatmapScores, offsets, displacementFwd, displacementBwd, padding } =
    await estimatePoseOutputs(sample, posenetModel);

  const posenetOutput = poseOutputsToAray(
    heatmapScores,
    offsets,
    displacementFwd,
    displacementBwd
  );

  return posenetOutput;
}

async function predict(poseOutput, model) {
  const embeddings = tf.tensor([poseOutput]);
  const logits = model.predict(embeddings);

  const values = await logits.data();

  const classes = [];
  for (let i = 0; i < values.length; i++) {
    classes.push({
      probability: values[i],
    });
  }

  embeddings.dispose();
  logits.dispose();

  return classes;
}

(async function () {
  console.log("OFFSCREEN");
  // await tf.ready();
  // await tf.setBackend("wasm");
  const posenetModel = await posenet.load({
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: 257,
    multiplier: 0.75,
    modelUrl: "./mobilenet/model-stride16.json",
  });
  webcam = new Webcam();
  await webcam.setup({
    width: 480,
    height: 480,
    targetFPS: 1,
  });
  console.log(webcam);
  console.log("posenetModel", posenetModel);
  const posenetOutput = await estimatePose(webcam.video, posenetModel);
  const customModel = await tf.loadLayersModel("./model/model.json");
  console.log(await predict(posenetOutput, customModel));
})();

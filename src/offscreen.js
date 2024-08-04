import Webcam from "./camera.js";
import "@tensorflow/tfjs"; //used only to initialise the backend. Posenet library is very much outdated unfortunately, and cannot do this via normal setup.
import * as posenet from "@tensorflow-models/posenet";
import { padAndResizeTo } from "@tensorflow-models/posenet/dist/util";

let model, webcam, labelContainer, maxPredictions;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmPose.loadFromFiles() in the API to support files from a file picker
  model = await tmPose.loadFromFiles();
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
}

async function loop(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    console.log(classPrediction);
  }
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
  console.log(await estimatePose(webcam.video, posenetModel));
})();

import Webcam from "./camera.js";
import PoseDetector from "./utils/CustomPosenet.js";

let model, webcam, labelContainer, maxPredictions;

(async function () {
  // await tf.ready();
  // await tf.setBackend("wasm");
  webcam = new Webcam();
  await webcam.setup({
    width: 480,
    height: 480,
    targetFPS: 1,
  });
  const poseDetector = new PoseDetector();
  await poseDetector.init();

  console.log(await poseDetector.predict(webcam.video));
})();

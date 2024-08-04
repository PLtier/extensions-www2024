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

  const port = chrome.runtime.connect({ name: "content-script-port" });

  setInterval(async () => {
    const a = await poseDetector.predict(webcam.video);
    console.log(a);
    port.postMessage({ data: a });
  }, 1000);
})();

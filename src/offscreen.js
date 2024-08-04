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
  setInterval(async () => {
    const [a, b, c] = await poseDetector.predict(webcam.video);
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const response = await chrome.tabs.sendMessage(tab.id, {
      greeting: "hello",
    });
  }, 1000);
})();

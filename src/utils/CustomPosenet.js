import * as tf from "@tensorflow/tfjs"; //used only to initialise the backend. Posenet library is very much outdated unfortunately, and cannot do this via normal setup.
import * as posenet from "@tensorflow-models/posenet";
import { padAndResizeTo } from "@tensorflow-models/posenet/dist/util";

export default class PoseDetector {
  constructor(parameters) {}
  #customModel;
  #posenetModel;
  async init() {
    this.#customModel = await tf.loadLayersModel("./model/model.json");
    this.#posenetModel = await posenet.load({
      architecture: "MobileNetV1",
      outputStride: 16,
      inputResolution: 257,
      multiplier: 0.75,
      modelUrl: "./mobilenet/model-stride16.json",
    });
  }

  async #estimatePoseOutputs(sample) {
    const inputResolution = this.#posenetModel.inputResolution;

    const { resized, padding } = padAndResizeTo(sample, inputResolution);

    const { heatmapScores, offsets, displacementFwd, displacementBwd } =
      await this.#posenetModel.baseModel.predict(resized);

    resized.dispose();

    return {
      heatmapScores,
      offsets,
      displacementFwd,
      displacementBwd,
      padding,
    };
  }

  #poseOutputsToAray(heatmapScores, offsets, displacementFwd, displacementBwd) {
    const axis = 2;
    const concat = tf.concat([heatmapScores, offsets], axis);
    const concatArray = concat.dataSync();

    concat.dispose();

    return concatArray;
  }

  async #estimatePose(sample, posenetModel, flipHorizontal = false) {
    const {
      heatmapScores,
      offsets,
      displacementFwd,
      displacementBwd,
      padding,
    } = await this.#estimatePoseOutputs(sample, posenetModel);

    const posenetOutput = this.#poseOutputsToAray(
      heatmapScores,
      offsets,
      displacementFwd,
      displacementBwd
    );

    return posenetOutput;
  }

  async predict(webcam_video) {
    const poseOutput = await this.#estimatePose(webcam_video);
    const embeddings = tf.tensor([poseOutput]);
    const logits = this.#customModel.predict(embeddings);

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
}

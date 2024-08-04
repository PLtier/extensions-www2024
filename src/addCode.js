const posenetModel = await posenet.load({
  architecture: "MobileNetV1",
  outputStride: 16,
  inputResolution: 257,
  multiplier: 0.75,
  modelUrl: "./mobilenet/model-stride16.json",
});

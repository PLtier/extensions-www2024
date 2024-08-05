class Webcam {
  video = document.createElement("video");
  constructor() {
    this.video.style.transform = "scaleX(-1)";
  }

  async setup(cameraParam) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    const { targetFPS, width, height } = cameraParam;
    const videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        width: width,
        height: height,
        frameRate: {
          //ideal: targetFPS,
          min: targetFPS,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    this.video.srcObject = stream;
    this.video.width = width;
    this.video.weight = height;

    await new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        resolve(this.video);
      };
    });

    this.video.play();
  }
}

export default Webcam;

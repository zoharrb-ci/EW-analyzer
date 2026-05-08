const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults((results) => {
    // 1. Draw the visual feedback
    drawScene(results, canvasCtx, canvasElement);
    
    // 2. Run the EW Engine
    if (results.poseLandmarks) {
        const ewData = calculateEWMN(results.poseLandmarks);
        updateHUD(ewData);
    }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();
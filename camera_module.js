const videoElement = document.getElementById('input_video');
const statusDiv = document.getElementById('status');

const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// This triggers every time MediaPipe finishes analyzing a frame
pose.onResults((results) => {
    statusDiv.innerHTML = "STATUS: TRACKING ACTIVE";
    statusDiv.style.color = "#0f0";
    
    drawScene(results, canvasCtx, canvasElement);
    
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

// Log to console so we can see progress
console.log("Camera starting...");
camera.start().catch(err => {
    statusDiv.innerHTML = "STATUS: CAMERA ERROR";
    console.error(err);
});
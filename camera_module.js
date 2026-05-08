const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');

const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

pose.setOptions({ 
    modelComplexity: 2, // Increased complexity for better hand/forearm tracking
    smoothLandmarks: true, 
    minDetectionConfidence: 0.6, 
    minTrackingConfidence: 0.6 
});

pose.onResults((results) => {
    statusDiv.innerHTML = "STATUS: TRACKING ACTIVE";
    drawScene(results, canvasCtx, canvasElement);
    if (results.poseLandmarks) {
        const ewData = calculateEWMN(results.poseLandmarks);
        updateHUD(ewData);
    }
});

// Requesting High Definition
const camera = new Camera(videoElement, {
    onFrame: async () => { await pose.send({image: videoElement}); },
    width: 1920, 
    height: 1080
});
camera.start();
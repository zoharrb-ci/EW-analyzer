const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');

// Set internal canvas resolution
canvasElement.width = 1920;
canvasElement.height = 1080;

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
    if (!results.image) return;
    
    // Status update
    statusDiv.innerHTML = "STATUS: ACTIVE";
    
    // Process EWMN Data
    const ewData = calculateEWMN(results.poseLandmarks);
    
    // Render Frame
    drawScene(results, canvasCtx, canvasElement, ewData);
    
    // Update Text HUD
    if (ewData) {
        updateHUD(ewData);
    }
});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({image: videoElement});
    },
    width: 1920,
    height: 1080
});

// Start with error catch
camera.start().catch(err => {
    statusDiv.innerHTML = "STATUS: <span style='color:red'>CAMERA ERROR</span>";
    console.error("Camera failed:", err);
});
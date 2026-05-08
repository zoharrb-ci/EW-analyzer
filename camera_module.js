const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');

// Set canvas internal resolution to match HD
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
    // This function sends the data to your UI and Engine
    drawScene(results, canvasCtx, canvasElement);
    
    if (results.poseLandmarks) {
        const ewData = calculateEWMN(results.poseLandmarks);
        if (ewData) {
            updateHUD(ewData);
        }
    }
});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({image: videoElement});
    },
    width: 1920,
    height: 1080
});

camera.start().then(() => {
    console.log("Camera started successfully.");
}).catch(err => {
    statusDiv.innerHTML = "STATUS: CAMERA ERROR";
    console.error(err);
});
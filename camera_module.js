/**
 * CAMERA_MODULE.JS
 * Responsible for MediaPipe initialization and Hardware Stream
 */
window.pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 1, // 1 for speed, 2 for precision
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

window.camera = new Camera(document.getElementById('input_video'), {
    onFrame: async () => {
        await pose.send({ image: document.getElementById('input_video') });
    },
    width: 1280,
    height: 720
});

window.initEngine = () => {
    document.getElementById('start-prompt').style.display = 'none';
    camera.start();
};
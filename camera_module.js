/**
 * CAMERA_MODULE.JS - Hardware & Engine Initialization
 */
window.pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 1, // Balanced for real-time performance
    smoothLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

window.camera = new Camera(document.getElementById('input_video'), {
    onFrame: async () => {
        await pose.send({ image: document.getElementById('input_video') });
    },
    width: 1280,
    height: 720
});

window.initEngine = () => {
    // Required to unlock AudioContext on most browsers
    if (window.audioCtx && window.audioCtx.state === 'suspended') {
        window.audioCtx.resume();
    }
    document.getElementById('start-prompt').style.display = 'none';
    camera.start();
};
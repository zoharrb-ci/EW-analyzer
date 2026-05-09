// Add this safety check inside your pose.onResults loop
pose.onResults((results) => {
    // 1. Check if we have a valid image and landmarks
    if (!results.image || !results.poseLandmarks) {
        console.warn("Pose data missing - system idling...");
        return; 
    }

    // 2. Force Canvas resize to match video stream
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the background feed
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // 3. Process EWMN Data
    const landmarks = results.poseLandmarks;
    const ewData = calculateEWMN(landmarks); // Your calculation function

    if (ewData) {
        updateMatrixUI(ewData);   // Updates the HTML table
        renderVisuals(landmarks, ewData); // Draws V4, H0, and Traces
    }
    
    ctx.restore();
});

function updateMatrixUI(data) {
    // Direct DOM manipulation to ensure the table updates
    document.getElementById('rh').innerText = data.right.h;
    document.getElementById('rv').innerText = data.right.v;
    document.getElementById('rd').innerText = `${data.right.hDeg}°|${data.right.vDeg}°`;

    document.getElementById('lh').innerText = data.left.h;
    document.getElementById('lv').innerText = data.left.v;
    document.getElementById('ld').innerText = `${data.left.hDeg}°|${data.left.vDeg}°`;
}
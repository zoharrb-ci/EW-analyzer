/**
 * UI Renderer Module
 * Responsibilities: Drawing the skeleton, the EWMN Grid, and the HUD.
 */

// 1. Function to update the text in your HTML HUD
function updateHUD(ewData) {
    const rHandDiv = document.getElementById('r_hand');
    const statusDiv = document.getElementById('status');

    if (ewData) {
        // Display Horizontal (0-7) and Vertical (0-4)
        rHandDiv.innerHTML = `R-ARM: H ${ewData.h} | V (${ewData.v})`;
        rHandDiv.style.color = "#0f0"; // Green for active tracking
        statusDiv.innerHTML = "STATUS: TRACKING ACTIVE";
    } else {
        statusDiv.innerHTML = "STATUS: SEARCHING FOR BODY...";
        statusDiv.style.color = "orange";
    }
}

// 2. Main Drawing Function
function drawScene(results, ctx, canvas) {
    // Clear the canvas for the new frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw if landmarks are detected
    if (results.poseLandmarks) {
        
        // Draw MediaPipe Skeleton (Connective lines)
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,
                      {color: '#00FF00', lineWidth: 2});
        
        // Draw MediaPipe Landmarks (Joint points)
        drawLandmarks(ctx, results.poseLandmarks,
                     {color: '#FF0000', lineWidth: 1, radius: 3});

        // DRAW EWMN VISUAL GRID (The "Compass")
        drawEWMNCompass(ctx, results.poseLandmarks[12]); // Centered on Right Shoulder
    }
    ctx.restore();
}

/**
 * Draws a 45-degree "Compass Rose" around a joint
 * to visualize the 0-7 horizontal positions.
 */
function drawEWMNCompass(ctx, centerLandmark) {
    const x = centerLandmark.x * 1280; // Scale to canvas width
    const y = centerLandmark.y * 720;  // Scale to canvas height
    const radius = 80;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)'; // Translucent green
    ctx.lineWidth = 1;

    // Draw the 8 slices (45 degrees each)
    for (let i = 0; i < 8; i++) {
        const angle = i * 45 * (Math.PI / 180);
        ctx.moveTo(x, y);
        ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        
        // Add position numbers (0-7) at the edge of the lines
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(i, x + (radius + 15) * Math.cos(angle) - 5, y + (radius + 15) * Math.sin(angle) + 5);
    }
    ctx.stroke();

    // Draw central circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}
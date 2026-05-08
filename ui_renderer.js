/**
 * UI Renderer Module
 * Responsibilities: Drawing the skeleton, the EWMN Grid, and the HUD.
 */

// 1. function updateHUD(ewData) {
    const rHandDiv = document.getElementById('r_hand');
    const lHandDiv = document.getElementById('l_hand');

    if (ewData) {
        // Update Right Arm if data exists
        if (ewData.right) {
            rHandDiv.innerHTML = `R-ARM: H ${ewData.right.h} | V ${ewData.right.v}`;
        } else {
            rHandDiv.innerHTML = `R-ARM: H - | V -`;
        }

        // Update Left Arm if data exists
        if (ewData.left) {
            lHandDiv.innerHTML = `L-ARM: H ${ewData.left.h} | V ${ewData.left.v}`;
        } else {
            lHandDiv.innerHTML = `L-ARM: H - | V -`;
        }
    }
}

// 2. Main Drawing Function
function drawScene(results, ctx, canvas) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw if landmarks are detected
    if (results.poseLandmarks) {
        
        // Use browser-safe MediaPipe drawing aliases
        const drawingUtils = window;
        const mpPose = window;

        if (drawingUtils.drawConnectors && mpPose.POSE_CONNECTIONS) {
            // Draw MediaPipe Skeleton (Connective lines)
            drawingUtils.drawConnectors(ctx, results.poseLandmarks, mpPose.POSE_CONNECTIONS,
                          {color: '#00FF00', lineWidth: 2});
        }
        
        if (drawingUtils.drawLandmarks) {
            // Draw MediaPipe Landmarks (Joint points)
            drawingUtils.drawLandmarks(ctx, results.poseLandmarks,
                         {color: '#FF0000', lineWidth: 1, radius: 3});
        }

        // DRAW EWMN VISUAL GRID (The "Compass") on both shoulders
        drawEWMNCompass(ctx, results.poseLandmarks[12], "Right"); // Right Shoulder
        drawEWMNCompass(ctx, results.poseLandmarks[11], "Left");  // Left Shoulder
    }
    ctx.restore();
}

/**
 * Draws a 45-degree "Compass Rose" around a joint
 * to visualize the 0-7 horizontal positions.
 */
function drawEWMNCompass(ctx, centerLandmark, side) {
    if (!centerLandmark) return;
    
    const x = centerLandmark.x * 1280; // Scale to canvas width
    const y = centerLandmark.y * 720;  // Scale to canvas height
    const radius = 60;

    ctx.beginPath();
    ctx.strokeStyle = side === "Right" ? 'rgba(0, 255, 0, 0.4)' : 'rgba(0, 180, 255, 0.4)'; 
    ctx.lineWidth = 1.5;

    // Draw the 8 slices (45 degrees each)
    for (let i = 0; i < 8; i++) {
        const angle = i * 45 * (Math.PI / 180);
        ctx.moveTo(x, y);
        ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        
        // Add position numbers (0-7) at the edge of the lines
        ctx.fillStyle = "white";
        ctx.font = "10px monospace";
        ctx.fillText(i, x + (radius + 12) * Math.cos(angle) - 3, y + (radius + 12) * Math.sin(angle) + 4);
    }
    ctx.stroke();

    // Draw central circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
}
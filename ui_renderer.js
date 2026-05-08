function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    const statusDiv = document.getElementById('status');

    if (ewData) {
        if (ewData.allCalibrated) {
            statusDiv.innerHTML = "STATUS: <span style='color:#0f0'>CALIBRATED</span>";
        }

        if (ewData.right) {
            rDiv.innerHTML = `R-ARM: H ${ewData.right.h} (${ewData.right.hDeg}°) | V ${ewData.right.v} (${ewData.right.vDeg}°)`;
        }
        if (ewData.left) {
            lDiv.innerHTML = `L-ARM: H ${ewData.left.h} (${ewData.left.hDeg}°) | V ${ewData.left.v} (${ewData.left.vDeg}°)`;
        }
    }
}

function drawScene(results, ctx, canvas, ewData) {
    if (!results) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    if (results.poseLandmarks) {
        // Draw general skeleton in subtle green
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF0044', lineWidth: 2});
        
        // HIGHLIGHT MEASURED LIMBS IN RED
        if (ewData) {
            const limbsToColor = [
                {s: 14, e: 16}, // Right Forearm
                {s: 13, e: 15}  // Left Forearm
            ];
            
            limbsToColor.forEach(limb => {
                const start = results.poseLandmarks[limb.s];
                const end = results.poseLandmarks[limb.e];
                ctx.beginPath();
                ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
                ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 5; // Thicker for emphasis
                ctx.stroke();
            });
        }

        // Draw joint dots
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 1, radius: 2});
    }
    ctx.restore();
}
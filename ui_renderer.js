function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    const statusDiv = document.getElementById('status');
    const calibInst = document.getElementById('calib_instruction');

    if (ewData) {
        // Handle Calibration Status
        if (ewData.allCalibrated) {
            statusDiv.innerHTML = "STATUS: <span style='color:#0f0'>CALIBRATED & TRACKING</span>";
            statusDiv.style.borderColor = "#0f0";
            calibInst.style.display = "none"; // Hide instructions when done
        } else {
            statusDiv.innerHTML = "STATUS: <span style='color:orange'>CALIBRATING...</span>";
            statusDiv.style.borderColor = "orange";
            calibInst.style.display = "block";
        }

        // Update Coordinates
        if (ewData.right) {
            const rColor = ewData.right.calibrated ? "#0f0" : "#ffae00";
            rDiv.innerHTML = `<span style="color:${rColor}">R-ARM: H ${ewData.right.h} | V ${ewData.right.v}</span>`;
        }
        if (ewData.left) {
            const lColor = ewData.left.calibrated ? "#0f0" : "#ffae00";
            lDiv.innerHTML = `<span style="color:${lColor}">L-ARM: H ${ewData.left.h} | V ${ewData.left.v}</span>`;
        }
    }
}

function drawScene(results, ctx, canvas) {
    if (!results) return;

    ctx.save();
    // 1. Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. DRAW THE IMAGE (This is what's missing on your screen)
    // We draw results.image which is provided by the Pose library
    if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    // 3. Draw the skeleton overlay
    if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, 
            {color: '#00FF0033', lineWidth: 1});
        drawLandmarks(ctx, results.poseLandmarks, 
            {color: '#FF0000', lineWidth: 0.5, radius: 1});
    }
    ctx.restore();
}
function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    const statusDiv = document.getElementById('status');
    const calibInst = document.getElementById('calib_instruction');

    if (ewData) {
        if (ewData.allCalibrated) {
            statusDiv.innerHTML = "STATUS: <span style='color:#0f0'>CALIBRATED & TRACKING</span>";
            statusDiv.style.borderColor = "#0f0";
            if(calibInst) calibInst.style.display = "none";
        } else {
            statusDiv.innerHTML = "STATUS: <span style='color:orange'>CALIBRATING...</span>";
            statusDiv.style.borderColor = "orange";
        }

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    if (results.poseLandmarks) {
        // Connectors: 2px thickness (Increased 100%)
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, 
            {color: '#00FF0077', lineWidth: 2});
            
        // Landmarks: Radius 2 (Increased 100%)
        drawLandmarks(ctx, results.poseLandmarks, 
            {color: '#FF0000', lineWidth: 1, radius: 2});
    }
    ctx.restore();
}
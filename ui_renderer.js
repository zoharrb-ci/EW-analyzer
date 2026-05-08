/**
 * UI Renderer - Bilateral Color Coding
 */

function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    const statusDiv = document.getElementById('status');
    const calibInst = document.getElementById('calib_instruction');

    if (ewData) {
        if (ewData.allCalibrated) {
            statusDiv.innerHTML = "STATUS: <span style='color:#0f0'>CALIBRATED</span>";
            if(calibInst) calibInst.style.display = "none";
        } else {
            statusDiv.innerHTML = "STATUS: <span style='color:orange'>CALIBRATING...</span>";
        }

        // Right Arm Display (Red)
        if (ewData.right) {
            rDiv.innerHTML = `<span style="color:#FF0000">R-ARM: H ${ewData.right.h} (${ewData.right.hDeg}°) | V ${ewData.right.v} (${ewData.right.vDeg}°)</span>`;
        }
        // Left Arm Display (Yellow)
        if (ewData.left) {
            lDiv.innerHTML = `<span style="color:#FFFF00">L-ARM: H ${ewData.left.h} (${ewData.left.hDeg}°) | V ${ewData.left.v} (${ewData.left.vDeg}°)</span>`;
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
        // Subtle background connections
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#ffffff22', lineWidth: 1});
        
        // --- DRAW RIGHT ARM (RED) ---
        const rS = results.poseLandmarks[14]; // R Elbow
        const rE = results.poseLandmarks[16]; // R Wrist
        ctx.beginPath();
        ctx.moveTo(rS.x * canvas.width, rS.y * canvas.height);
        ctx.lineTo(rE.x * canvas.width, rE.y * canvas.height);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 6;
        ctx.stroke();

        // --- DRAW LEFT ARM (YELLOW) ---
        const lS = results.poseLandmarks[13]; // L Elbow
        const lE = results.poseLandmarks[15]; // L Wrist
        ctx.beginPath();
        ctx.moveTo(lS.x * canvas.width, lS.y * canvas.height);
        ctx.lineTo(lE.x * canvas.width, lE.y * canvas.height);
        ctx.strokeStyle = '#FFFF00'; 
        ctx.lineWidth = 6;
        ctx.stroke();

        // Standard Joint Markers (Reduced visibility to focus on limbs)
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 1, radius: 2});
    }
    ctx.restore();
}
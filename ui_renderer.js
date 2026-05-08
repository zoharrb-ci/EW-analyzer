function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    const statusDiv = document.getElementById('status');
    const calibInst = document.getElementById('calib_instruction');

    if (ewData.allCalibrated) {
        statusDiv.innerHTML = "STATUS: <span style='color:#0f0'>TRACKING</span>";
        if(calibInst) calibInst.style.display = "none";
    }

    rDiv.innerHTML = `R-ARM: H ${ewData.right.h} (${ewData.right.hDeg}°) | V ${ewData.right.v} (${ewData.right.vDeg}°)`;
    lDiv.innerHTML = `L-ARM: H ${ewData.left.h} (${ewData.left.hDeg}°) | V ${ewData.left.v} (${ewData.left.vDeg}°)`;
}

function drawScene(results, ctx, canvas, ewData) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        // Subtle Green Skeleton
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF0044', lineWidth: 2});
        
        // RED HIGHLIGHT FOR MEASURED LIMBS
        const activeLimbs = [[14, 16], [13, 15]];
        activeLimbs.forEach(pair => {
            const s = results.poseLandmarks[pair[0]];
            const e = results.poseLandmarks[pair[1]];
            ctx.beginPath();
            ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
            ctx.lineTo(e.x * canvas.width, e.y * canvas.height);
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 6;
            ctx.stroke();
        });

        // Landmark points
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 1, radius: 2});
    }
    ctx.restore();
}
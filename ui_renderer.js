function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    if (ewData && ewData.right) {
        rDiv.innerHTML = `R-ARM: H ${ewData.right.h} | V ${ewData.right.v}`;
    }
    if (ewData && ewData.left) {
        lDiv.innerHTML = `L-ARM: H ${ewData.left.h} | V ${ewData.left.v}`;
    }
}

function drawScene(results, ctx, canvas) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background video
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        // Ultra-thin lines (0.5px or 1px) for professional movement analysis
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF0033', lineWidth: 1});
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 1, radius: 1.5});
    }
    ctx.restore();
}
function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    if (ewData) {
        rDiv.innerHTML = `R-ARM: H ${ewData.right.h} | V ${ewData.right.v}`;
        lDiv.innerHTML = `L-ARM: H ${ewData.left.h} | V ${ewData.left.v}`;
    }
}

function drawScene(results, ctx, canvas) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // DRAW THE VIDEO FRAME FIRST (This makes the video visible again)
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2, radius: 5});
    }
    ctx.restore();
}
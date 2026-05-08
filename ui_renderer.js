function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    if (ewData && ewData.right) {
        rDiv.innerHTML = `R-FOREARM: H ${ewData.right.h} | V ${ewData.right.v}`;
    }
    if (ewData && ewData.left) {
        lDiv.innerHTML = `L-FOREARM: H ${ewData.left.h} | V ${ewData.left.v}`;
    }
}

function drawScene(results, ctx, canvas) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        // Thinner lines (1px) and smaller dots (2px)
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 1});
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 1, radius: 2});
    }
    ctx.restore();
}
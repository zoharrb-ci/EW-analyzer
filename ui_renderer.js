function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');

    if (ewData.right) {
        rDiv.innerHTML = `R: H${ewData.right.h} V${ewData.right.v} | ${ewData.right.vDeg}° | <span style="color:white">${ewData.right.weight}</span>`;
    }
    if (ewData.left) {
        lDiv.innerHTML = `L: H${ewData.left.h} V${ewData.left.v} | ${ewData.left.vDeg}° | <span style="color:white">${ewData.left.weight}</span>`;
    }
}

function drawScene(results, ctx, canvas, ewData) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks && ewData) {
        // Draw Matrix Center (Shoulder Midpoint)
        ctx.beginPath();
        ctx.arc(ewData.center.x * canvas.width, ewData.center.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00FFFF';
        ctx.fill();

        // Right (Red)
        const rS = results.poseLandmarks[14];
        const rE = results.poseLandmarks[16];
        drawLine(ctx, rS, rE, '#FF0000', canvas);

        // Left (Yellow)
        const lS = results.poseLandmarks[13];
        const lE = results.poseLandmarks[15];
        drawLine(ctx, lS, lE, '#FFFF00', canvas);
    }
    ctx.restore();
}

function drawLine(ctx, s, e, color, canvas) {
    ctx.beginPath();
    ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
    ctx.lineTo(e.x * canvas.width, e.y * canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.stroke();
}
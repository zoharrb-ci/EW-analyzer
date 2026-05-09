pose.onResults((results) => {
    if (!results.poseLandmarks) return;
    
    // Clear and Draw Video
    ctx.save();
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    const landmarks = results.poseLandmarks;
    const data = calculateEWMN(landmarks);

    // --- UPDATE DATA TABLE ---
    document.getElementById('rh').innerText = data.right.h;
    document.getElementById('rv').innerText = data.right.v;
    document.getElementById('rd').innerText = data.right.deg;

    document.getElementById('lh').innerText = data.left.h;
    document.getElementById('lv').innerText = data.left.v;
    document.getElementById('ld').innerText = data.left.deg;

    // --- DRAW EWMN AXIS (Visual Overlay) ---
    ctx.lineWidth = 2;
    
    // Draw V4 (Spine Axis)
    ctx.strokeStyle = '#00ffcc';
    ctx.beginPath();
    ctx.moveTo(landmarks[12].x * canvasElement.width, landmarks[12].y * canvasElement.height);
    ctx.lineTo(landmarks[11].x * canvasElement.width, landmarks[11].y * canvasElement.height);
    ctx.stroke();

    // Draw Right Arm Vector
    ctx.strokeStyle = '#ff4444'; // Red for Right
    ctx.beginPath();
    ctx.moveTo(landmarks[12].x * canvasElement.width, landmarks[12].y * canvasElement.height);
    ctx.lineTo(landmarks[16].x * canvasElement.width, landmarks[16].y * canvasElement.height);
    ctx.stroke();

    // Draw Left Arm Vector
    ctx.strokeStyle = '#ffee00'; // Yellow for Left
    ctx.beginPath();
    ctx.moveTo(landmarks[11].x * canvasElement.width, landmarks[11].y * canvasElement.height);
    ctx.lineTo(landmarks[15].x * canvasElement.width, landmarks[15].y * canvasElement.height);
    ctx.stroke();

    ctx.restore();
});
/**
 * UI_RENDERER.JS - Movement Plane Visualization
 */
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');

function drawMovementPlane(path, color) {
    if (path.length < 2) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = document.getElementById('opacity-slider').value * 0.5;

    for (let i = 1; i < path.length; i++) {
        const prev = path[i-1];
        const curr = path[i];

        // Draw a polygon between the two limb lines
        ctx.moveTo(prev.p.x * w, prev.p.y * h);
        ctx.lineTo(prev.d.x * w, prev.d.y * h);
        ctx.lineTo(curr.d.x * w, curr.d.y * h);
        ctx.lineTo(curr.p.x * w, curr.p.y * h);
        ctx.closePath();
    }
    ctx.fill();
    
    // Draw the "ribbon" edges for clarity
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
}

pose.onResults((res) => {
    if (!res.poseLandmarks) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);

    const lm = res.poseLandmarks;
    const data = calculateEWMN(lm);
    
    // 1. Draw the history planes
    drawMovementPlane(window.rPath, '#ff4444'); // Red Plane
    drawMovementPlane(window.lPath, '#ffee00'); // Yellow Plane

    // 2. Draw current limb axis (The "leading edge")
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(lm[12].x * canvas.width, lm[12].y * canvas.height);
    ctx.lineTo(lm[16].x * canvas.width, lm[16].y * canvas.height);
    ctx.stroke();

    ctx.restore();
    updateHUD(data); // Assume updateHUD exists from previous versions
});
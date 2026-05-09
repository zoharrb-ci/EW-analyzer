/**
 * UI_RENDERER.JS - Plane Compass & Scaffolding
 */
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');

window.drawScene = function(res, data) {
    const lm = res.poseLandmarks;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(res.image, 0, 0, w, h);

    // 1. Draw Plane Compass (Around Right Shoulder)
    drawPlaneCompass(ctx, lm[12], data.right.h, w, h);

    // 2. Draw Body-wise 0 Arrow
    drawBodyZero(ctx, lm, data.torso.deg, w, h);

    // 3. Render Limb Vectors & Traces (Standard Logic)
    // ... [Previous tracing and limb drawing code goes here] ...

    ctx.restore();
};

function drawPlaneCompass(ctx, joint, hVal, w, h) {
    const x = joint.x * w;
    const y = joint.y * h;
    const radius = 100;

    // A. Horizontal Plane (H) - Semi-transparent Disk
    ctx.beginPath();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#00ffcc';
    ctx.ellipse(x, y, radius, radius/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // B. Vertical Plane (V) - Vertical Arc
    ctx.beginPath();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#ffee00';
    ctx.lineWidth = 2;
    ctx.arc(x, y, radius, -Math.PI/2, Math.PI/2);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
}

function drawBodyZero(ctx, lm, torsoDeg, w, h) {
    const centerX = (lm[23].x + lm[24].x)/2 * w;
    const centerY = (lm[23].y + lm[24].y)/2 * h + 40;

    ctx.save();
    ctx.translate(centerX, centerY);
    
    // If Spacewise, the arrow is fixed to the camera (down on screen)
    // If Bodywise, the arrow rotates with the torsoDeg
    if (window.mode === 'bodywise') {
        ctx.rotate((torsoDeg - 90) * Math.PI / 180);
    }

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 60); // Direction Indicator
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText("FRONT (0)", -25, 75);
    ctx.restore();
}
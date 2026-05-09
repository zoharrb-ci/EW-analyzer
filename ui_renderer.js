/**
 * UI_RENDERER.JS - Plane & Compass Visualization
 */
window.drawCompass = function(ctx, joint, w, h, color, torsoDeg = 0) {
    const x = joint.x * w;
    const y = joint.y * h;
    const radius = 100;
    
    ctx.save();
    ctx.translate(x, y);
    if (window.mode === 'bodywise') ctx.rotate((torsoDeg - 90) * Math.PI / 180);

    // Contour Circle
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius/2.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Spokes & Labels 0-7
    ctx.font = "bold 12px Courier New";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < 8; i++) {
        const angle = (i * 45 * Math.PI / 180) + Math.PI/2;
        const lineX = Math.cos(angle) * radius;
        const lineY = Math.sin(angle) * (radius/2.5);
        
        ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(lineX, lineY); ctx.stroke();

        ctx.globalAlpha = 0.8;
        const labelX = Math.cos(angle) * (radius + 18);
        const labelY = Math.sin(angle) * (radius/2.5 + 10);
        ctx.fillText(i, labelX, labelY);
    }
    ctx.restore();
};

window.drawMovementPlane = function(ctx, path, w, h, color, opacity) {
    if (path.length < 2) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    for (let i = 1; i < path.length; i++) {
        ctx.beginPath();
        ctx.moveTo(path[i-1].p.x * w, path[i-1].p.y * h);
        ctx.lineTo(path[i-1].d.x * w, path[i-1].d.y * h);
        ctx.lineTo(path[i].d.x * w, path[i].d.y * h);
        ctx.lineTo(path[i].p.x * w, path[i].p.y * h);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
};
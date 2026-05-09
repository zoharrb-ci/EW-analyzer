/**
 * UI_RENDERER.JS - Shaded Movement Plane Visualization
 */
window.drawMovementPlane = function(ctx, path, w, h, colorBase, opacity) {
    if (path.length < 2) return;
    
    ctx.save();
    for (let i = 1; i < path.length; i++) {
        const p1 = path[i-1];
        const p2 = path[i];

        // Create a gradient from Shoulder (Proximal) to Wrist (Distal)
        // This creates the "shading" effect across the axis line
        const grad = ctx.createLinearGradient(
            p2.p.x * w, p2.p.y * h, 
            p2.d.x * w, p2.d.y * h
        );
        
        // Color stops: Solid at wrist, fading toward shoulder
        grad.addColorStop(0, `rgba(${colorBase}, 0)`);    // Shoulder (Transparent)
        grad.addColorStop(1, `rgba(${colorBase}, ${opacity})`); // Wrist (Solid)

        ctx.beginPath();
        ctx.fillStyle = grad;
        
        // Define the quadrilateral for this slice of movement
        ctx.moveTo(p1.p.x * w, p1.p.y * h);
        ctx.lineTo(p1.d.x * w, p1.d.y * h);
        ctx.lineTo(p2.d.x * w, p2.d.y * h);
        ctx.lineTo(p2.p.x * w, p2.p.y * h);
        ctx.closePath();
        ctx.fill();

        // Optional: Add a faint highlight to the distal "leading edge"
        ctx.globalAlpha = opacity * 0.5;
        ctx.strokeStyle = `rgb(${colorBase})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    ctx.restore();
};
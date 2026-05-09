/**
 * EW_ENGINE.JS - Plane-Tracing Logic
 */
window.mode = 'spacewise'; 
window.isTracking = false; 
window.rPath = []; // Now stores objects with {proximal, distal}
window.lPath = [];

window.calculateEWMN = function(lm) {
    const process = (p, d, torsoH = 0) => {
        const dx = d.x - p.x, dy = d.y - p.y, dz = d.z - p.z;
        const horizontalDist = Math.sqrt(dx*dx + dz*dz);
        const vDeg = Math.atan2(horizontalDist, -dy) * (180/Math.PI); 
        const vPos = Math.max(0, Math.min(4, Math.round(vDeg/45)));
        
        let hDeg = Math.atan2(dx, -dz) * (180/Math.PI);
        if (hDeg < 0) hDeg += 360;

        if (window.mode === 'bodywise') {
            hDeg = (hDeg - torsoH + 360) % 360;
        }

        return { h: Math.round(hDeg/45)%8, v: vPos, degH: Math.round(hDeg), degV: Math.round(vDeg) };
    };

    const sDX = lm[12].x - lm[11].x;
    const sDZ = lm[12].z - lm[11].z;
    let tDeg = Math.atan2(sDX, -sDZ) * (180/Math.PI) + 90;
    if (tDeg < 0) tDeg += 360;

    const data = {
        right: process(lm[12], lm[16], tDeg),
        left: process(lm[11], lm[15], tDeg),
        torso: { h: Math.round(tDeg/45)%8, deg: Math.round(tDeg) }
    };

    // Store the full axis line for plane creation
    if (window.isTracking) {
        window.rPath.push({
            p: {x: lm[12].x, y: lm[12].y}, 
            d: {x: lm[16].x, y: lm[16].y}
        });
        window.lPath.push({
            p: {x: lm[11].x, y: lm[11].y}, 
            d: {x: lm[15].x, y: lm[15].y}
        });
    }

    return data;
};

// Removed handleGestures function entirely
window.clearTraces = () => { window.rPath = []; window.lPath = []; };
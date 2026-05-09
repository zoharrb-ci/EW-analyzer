/**
 * EW_ENGINE.JS - Logic & Coordinate Transformation
 */
window.mode = 'spacewise'; 
window.isTracking = false; 
window.rPath = []; 
window.lPath = [];

window.calculateEWMN = function(lm) {
    const process = (p, d, torsoH = 0) => {
        const dx = d.x - p.x, dy = d.y - p.y, dz = d.z - p.z;
        
        // Vertical Logic: Down = V0, Up = V4
        const horizontalDist = Math.sqrt(dx*dx + dz*dz);
        const vDeg = Math.atan2(horizontalDist, -dy) * (180/Math.PI); 
        const vPos = Math.max(0, Math.min(4, Math.round(vDeg/45)));
        
        // Horizontal Logic: 0-7 segments
        let hDeg = Math.atan2(dx, -dz) * (180/Math.PI);
        if (hDeg < 0) hDeg += 360;

        // Normalization for Body-wise mode
        if (window.mode === 'bodywise') {
            hDeg = (hDeg - torsoH + 360) % 360;
        }

        return { 
            h: Math.round(hDeg/45)%8, 
            v: vPos, 
            degH: Math.round(hDeg), 
            degV: Math.round(vDeg) 
        };
    };

    // Calculate Torso Orientation (Shoulder line)
    const sDX = lm[12].x - lm[11].x;
    const sDZ = lm[12].z - lm[11].z;
    let tDeg = Math.atan2(sDX, -sDZ) * (180/Math.PI) + 90;
    if (tDeg < 0) tDeg += 360;

    return {
        right: process(lm[12], lm[16], tDeg),
        left: process(lm[11], lm[15], tDeg),
        torso: { deg: Math.round(tDeg) }
    };
};
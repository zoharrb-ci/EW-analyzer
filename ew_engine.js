/**
 * EW_ENGINE.JS - Logic & Coordinate Transformation
 * Corrected Vertical mapping and Flipped Horizontal orientation.
 */
window.mode = 'spacewise'; 
window.isTracking = false; 
window.rPath = []; 
window.lPath = [];

window.calculateEWMN = function(lm) {
    const process = (p, d, torsoH = 0) => {
        // Calculate relative displacement from proximal (shoulder) to distal (wrist) [cite: 36, 38]
        const dx = d.x - p.x;
        const dy = d.y - p.y;
        const dz = d.z - p.z;
        
        // 1. VERTICAL CALCULATION (V0 at Bottom, V4 at Top) [cite: 37, 57]
        const horizontalDist = Math.sqrt(dx * dx + dz * dz);
        // Using -dy ensures that -1 (up in MediaPipe) becomes 180° and +1 (down) becomes 0° [cite: 39]
        const vDeg = Math.atan2(horizontalDist, -dy) * (180 / Math.PI); 
        const vPos = Math.max(0, Math.min(4, Math.round(vDeg / 45)));
        
        // 2. HORIZONTAL CALCULATION (Flipped Spacewise) [cite: 32, 56]
        // To flip the horizontal orientation, we reverse the dx sign.
        // This ensures the H0-H7 sequence matches the mirrored spatial preference. [cite: 40, 41]
        let hDeg = Math.atan2(-dx, -dz) * (180 / Math.PI); 
        if (hDeg < 0) hDeg += 360;

        // Normalization for Body-wise mode [cite: 10]
        if (window.mode === 'bodywise') {
            hDeg = (hDeg - torsoH + 360) % 360;
        }

        return { 
            h: Math.round(hDeg / 45) % 8, 
            v: vPos, 
            degH: Math.round(hDeg), 
            degV: Math.round(vDeg) 
        };
    };

    // Calculate Torso Orientation for Body-wise normalization [cite: 11]
    const sDX = lm[12].x - lm[11].x;
    const sDZ = lm[12].z - lm[11].z;
    let tDeg = Math.atan2(sDX, -sDZ) * (180 / Math.PI) + 90;
    if (tDeg < 0) tDeg += 360;

    return {
        right: process(lm[12], lm[16], tDeg),
        left: process(lm[11], lm[15], tDeg),
        torso: { deg: Math.round(tDeg) }
    };
};
/**
 * EW_ENGINE.JS
 * Mathematical logic for EWMN and Gestural Triggers
 */
window.isTracking = false;
window.rPath = [];
window.lPath = [];

window.calculateEWMN = function(lm) {
    const process = (p, d) => {
        const dx = d.x - p.x, dy = d.y - p.y, dz = d.z - p.z;
        // Vertical Logic: Nadir(0) to Zenith(4)
        const vDeg = Math.atan2(Math.sqrt(dx*dx + dz*dz), -dy) * (180/Math.PI);
        const vPos = Math.max(0, Math.min(4, Math.round(vDeg/45)));
        
        // Horizontal Logic: Toward Camera(0)
        let hDeg = Math.atan2(dx, -dz) * (180/Math.PI);
        if (hDeg < 0) hDeg += 360;
        return { h: Math.round(hDeg/45)%8, v: vPos, raw: `${Math.round(hDeg)}°|${Math.round(vDeg)}°` };
    };
    return { right: process(lm[12], lm[16]), left: process(lm[11], lm[15]) };
};

window.handleGestures = function(lm) {
    // Right Thumb Up (Start) / Down (Stop)
    if (lm[22].y < lm[21].y - 0.04) window.isTracking = true;
    if (lm[22].y > lm[21].y + 0.04) window.isTracking = false;
    // Clap (Reset)
    if (Math.hypot(lm[15].x - lm[16].x, lm[15].y - lm[16].y) < 0.06) window.clearTraces();
};

window.clearTraces = function() {
    window.rPath = [];
    window.lPath = [];
};
/**
 * EW_ENGINE.JS - Logic with Body-wise/Spacewise Toggle
 */
window.isTracking = false;
window.mode = 'spacewise'; // Default mode
window.rPath = [];
window.lPath = [];

window.calculateEWMN = function(lm) {
    const process = (p, d, torsoDeg = 0) => {
        const dx = d.x - p.x, dy = d.y - p.y, dz = d.z - p.z;
        
        // Vertical (V) remains constant in both modes
        const vDeg = Math.atan2(Math.sqrt(dx*dx + dz*dz), -dy) * (180/Math.PI);
        const vPos = Math.max(0, Math.min(4, Math.round(vDeg/45)));
        
        // Horizontal (H)
        let hDeg = Math.atan2(dx, -dz) * (180/Math.PI);
        if (hDeg < 0) hDeg += 360;

        // If Body-wise, subtract torso rotation to make H0 relative to chest
        if (window.mode === 'bodywise') {
            hDeg = (hDeg - torsoDeg + 360) % 360;
        }

        return { h: Math.round(hDeg/45)%8, v: vPos, degH: Math.round(hDeg), degV: Math.round(vDeg) };
    };

    // Calculate Absolute Torso Facing
    const sDX = lm[12].x - lm[11].x;
    const sDZ = lm[12].z - lm[11].z;
    let tDeg = Math.atan2(sDX, -sDZ) * (180/Math.PI) + 90;
    if (tDeg < 0) tDeg += 360;
    const tH = Math.round(tDeg/45)%8;

    return {
        right: process(lm[12], lm[16], tDeg),
        left: process(lm[11], lm[15], tDeg),
        torso: { h: tH, deg: Math.round(tDeg) }
    };
};

window.toggleMode = function() {
    window.mode = (window.mode === 'spacewise') ? 'bodywise' : 'spacewise';
    const btn = document.getElementById('mode-toggle');
    btn.innerText = window.mode.toUpperCase() + " MODE";
    btn.style.background = (window.mode === 'bodywise') ? '#ffcc00' : 'transparent';
    btn.style.color = (window.mode === 'bodywise') ? '#000' : '#00ffcc';
};
/**
 * EW_ENGINE.JS - Logic, Audio, and Coordination Modes
 */
window.isTracking = false;
window.mode = 'spacewise'; 
window.rPath = [];
window.lPath = [];
window.showCompass = true; // Ensure compass is enabled by default

// Audio Setup
window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let lastValues = { rh: -1, rv: -1, lh: -1, lv: -1, th: -1 };

function playTick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

window.calculateEWMN = function(lm) {
    const process = (p, d, torsoDeg = 0) => {
        const dx = d.x - p.x, dy = d.y - p.y, dz = d.z - p.z;
        
        // VERTICAL FIX: 
        // MediaPipe Y is positive DOWN. 
        // To make Down=V0 (0°) and Up=V4 (180°):
        // We use atan2(horizontal_dist, -dy). 
        // When pointing down, -dy is negative, atan2 gives 0.
        const horizontalDist = Math.sqrt(dx*dx + dz*dz);
        const vDeg = Math.atan2(horizontalDist, -dy) * (180/Math.PI); 
        const vPos = Math.max(0, Math.min(4, Math.round(vDeg/45)));
        
        // HORIZONTAL
        let hDeg = Math.atan2(dx, -dz) * (180/Math.PI);
        if (hDeg < 0) hDeg += 360;

        if (window.mode === 'bodywise') {
            hDeg = (hDeg - torsoDeg + 360) % 360;
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

    if (data.right.h !== lastValues.rh || data.right.v !== lastValues.rv) {
        playTick();
        lastValues.rh = data.right.h; lastValues.rv = data.right.v;
    }

    return data;
};

window.toggleMode = function() {
    window.mode = (window.mode === 'spacewise') ? 'bodywise' : 'spacewise';
    const btn = document.getElementById('mode-toggle');
    
    // Response Indication (Visual Feedback)
    btn.style.transform = "scale(0.95)";
    setTimeout(() => btn.style.transform = "scale(1)", 100);
    
    btn.innerText = window.mode.toUpperCase() + " MODE";
    btn.className = window.mode === 'bodywise' ? 'btn-active' : '';
};
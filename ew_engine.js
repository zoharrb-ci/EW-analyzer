/**
 * EW_ENGINE.JS - Trigonometry, Gestures, and Audio
 */
window.isTracking = false;
window.rPath = [];
window.lPath = [];

// Audio Setup
window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let lastValues = { rh: -1, rv: -1, lh: -1, lv: -1, th: -1 };

function playTick() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

window.calculateEWMN = function(lm) {
    const process = (p, d) => {
        const dx = d.x - p.x, dy = d.y - p.y, dz = d.z - p.z;
        // Vertical (V0-V4)
        const vDeg = Math.atan2(Math.sqrt(dx*dx + dz*dz), -dy) * (180/Math.PI);
        const vPos = Math.max(0, Math.min(4, Math.round(vDeg/45)));
        // Horizontal (H0-H7)
        let hDeg = Math.atan2(dx, -dz) * (180/Math.PI);
        if (hDeg < 0) hDeg += 360;
        return { h: Math.round(hDeg/45)%8, v: vPos, degH: Math.round(hDeg), degV: Math.round(vDeg) };
    };

    // Torso Facing (Absolute Space-wise)
    const sDX = lm[12].x - lm[11].x;
    const sDZ = lm[12].z - lm[11].z;
    let tDeg = Math.atan2(sDX, -sDZ) * (180/Math.PI) + 90;
    if (tDeg < 0) tDeg += 360;
    const tH = Math.round(tDeg/45)%8;

    const data = {
        right: process(lm[12], lm[16]),
        left: process(lm[11], lm[15]),
        torso: { h: tH, deg: Math.round(tDeg) }
    };

    // Value Change Tick Detection
    if (data.right.h !== lastValues.rh || data.right.v !== lastValues.rv ||
        data.left.h !== lastValues.lh || data.left.v !== lastValues.lv ||
        data.torso.h !== lastValues.th) {
        playTick();
        lastValues = { rh: data.right.h, rv: data.right.v, lh: data.left.h, lv: data.left.v, th: data.torso.h };
    }

    return data;
};

window.handleGestures = function(lm) {
    // Like Gesture (Thumb vertically up apart from palm)
    if (lm[4].y < lm[3].y - 0.05 && Math.abs(lm[4].x - lm[2].x) > 0.1) isTracking = true;
    // Dislike Gesture (Thumb vertically down)
    if (lm[4].y > lm[3].y + 0.05) isTracking = false;
    // Clap (Reset)
    if (Math.hypot(lm[15].x - lm[16].x, lm[15].y - lm[16].y) < 0.06) window.clearTraces();
};

window.clearTraces = () => { window.rPath = []; window.lPath = []; };
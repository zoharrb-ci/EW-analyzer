/**
 * EWMN Geometry Engine - Vector Angle & Limb-Length Calibration
 */

let maxLimbLength = { right: 0.1, left: 0.1 };
let isCalibrated = { right: false, left: false };

function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    const results = {
        allCalibrated: isCalibrated.right && isCalibrated.left,
        right: null,
        left: null
    };

    const limbs = [
        { name: 'right', s: 14, e: 16 }, 
        { name: 'left', s: 13, e: 15 }
    ];

    limbs.forEach(limb => {
        const start = landmarks[limb.s];
        const end = landmarks[limb.e];

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dz_raw = end.z - start.z;

        const currentLength2D = Math.sqrt(dx * dx + dy * dy);

        // Calibration
        if (currentLength2D > maxLimbLength[limb.name]) {
            maxLimbLength[limb.name] = currentLength2D;
            if (currentLength2D > 0.12) isCalibrated[limb.name] = true;
        }

        let dz = 0;
        const L = maxLimbLength[limb.name];
        if (L > currentLength2D) {
            dz = Math.sqrt(Math.pow(L, 2) - Math.pow(dx, 2) - Math.pow(dy, 2)) || 0;
        }
        const finalDz = (dz_raw > 0) ? dz : -dz;

        // 1. VERTICAL ANGLE (Floor = 0°)
        // In MediaPipe, Y increases downward. To make Floor 0, we measure 
        // the angle relative to the downward Y-axis.
        let vAngleRaw = Math.atan2(-dy, Math.sqrt(dx*dx + finalDz*finalDz)) * (180 / Math.PI);
        // Normalize: 0 is floor, 90 is horizontal, 180 is ceiling
        let vAngleNormalized = vAngleRaw + 90; 
        let vPos = Math.round(vAngleNormalized / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        // 2. HORIZONTAL ANGLE (Camera = 0°)
        let hAngleRaw = Math.atan2(dx, -finalDz) * (180 / Math.PI);
        let hAngleNormalized = (hAngleRaw + 180) % 360;
        let hPos = Math.round(hAngleNormalized / 45) % 8;

        results[limb.name] = {
            h: hPos,
            v: vPos,
            hDeg: Math.round(hAngleNormalized),
            vDeg: Math.round(vAngleNormalized),
            calibrated: isCalibrated[limb.name],
            points: { start, end } // Passed for coloring
        };
    });

    return results;
}
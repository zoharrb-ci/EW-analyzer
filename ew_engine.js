/**
 * EWMN Geometry Engine - High Precision Calibration
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

        // 1. Vector components
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dz_raw = end.z - start.z;

        // 2. 2D projection length
        const currentLength2D = Math.sqrt(dx * dx + dy * dy);

        // 3. Calibration (T-Pose Capture)
        if (currentLength2D > maxLimbLength[limb.name]) {
            maxLimbLength[limb.name] = currentLength2D;
            if (currentLength2D > 0.12) isCalibrated[limb.name] = true;
        }

        // 4. Enhanced Depth Inference (Pythagorean)
        let dz = 0;
        const L = maxLimbLength[limb.name];
        if (L > currentLength2D) {
            dz = Math.sqrt(Math.pow(L, 2) - Math.pow(dx, 2) - Math.pow(dy, 2)) || 0;
        }
        // Apply directional sign from MediaPipe's Z-axis
        const finalDz = (dz_raw > 0) ? dz : -dz;

        // 5. EWMN VERTICAL (0-4)
        // Calculating angle from the downward Y-axis
        let vAngleDeg = Math.atan2(Math.sqrt(dx*dx + finalDz*finalDz), dy) * (180 / Math.PI);
        let vPos = Math.round(vAngleDeg / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        // 6. EWMN HORIZONTAL (0-7)
        // atan2(dx, -finalDz) ensures H0 is front (toward camera)
        let hAngleDeg = Math.atan2(dx, -finalDz) * (180 / Math.PI);
        let calibratedH = (hAngleDeg + 180) % 360;
        let hPos = Math.round(calibratedH / 45) % 8;

        results[limb.name] = {
            h: hPos,
            v: vPos,
            calibrated: isCalibrated[limb.name]
        };
    });

    return results;
}
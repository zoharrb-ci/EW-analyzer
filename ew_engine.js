/**
 * EWMN Clockwise Logic Engine - User Perspective
 */

let maxLimbLength = { right: 0.1, left: 0.1 };
let isCalibrated = { right: false, left: false };

function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    const bodyCenter = {
        x: (landmarks[11].x + landmarks[12].x) / 2,
        y: (landmarks[11].y + landmarks[12].y) / 2,
        z: (landmarks[11].z + landmarks[12].z) / 2
    };

    const results = { 
        allCalibrated: isCalibrated.right && isCalibrated.left,
        right: null, left: null, center: bodyCenter 
    };

    const limbs = [
        { name: 'right', s: 14, e: 16 }, 
        { name: 'left', s: 13, e: 15 }
    ];

    limbs.forEach(limb => {
        const joint = landmarks[limb.s];
        const extremity = landmarks[limb.e];

        const dx = extremity.x - joint.x;
        const dy = extremity.y - joint.y;
        const dz_raw = extremity.z - joint.z;

        const currentLength2D = Math.sqrt(dx * dx + dy * dy);
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

        // --- HORIZONTAL (Camera = 0, CW increase from User POV) ---
        // Mirror adjustment for user perspective: -dx
        let hAngleRaw = (Math.atan2(-dx, -finalDz) * (180 / Math.PI) + 180) % 360;
        let hPos = Math.round(hAngleRaw / 45) % 8;

        // --- VERTICAL (Floor = 0, CW increase toward Ceiling/Back) ---
        // dy is positive downward; we invert to make Floor 0 and Upward 180
        let vAngleRaw = Math.atan2(-dy, Math.sqrt(dx*dx + finalDz*finalDz)) * (180 / Math.PI) + 90;
        let vPos = Math.round(vAngleRaw / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        const isWristSupporting = extremity.y > 0.85; 
        const weightStatus = isWristSupporting ? "HEAVY-BASE" : "HEAVY-HANGING";

        results[limb.name] = {
            h: hPos, v: vPos,
            hDeg: Math.round(hAngleRaw),
            vDeg: Math.round(vAngleRaw),
            weight: weightStatus,
            isBase: isWristSupporting,
            calibrated: isCalibrated[limb.name]
        };
    });

    return results;
}
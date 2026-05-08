/**
 * EWMN Geometry Engine - Length-Calibrated Bilateral Version
 */

let maxLimbLength = { right: 0.05, left: 0.05 };
let isCalibrated = { right: false, left: false };

function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    const results = {
        allCalibrated: isCalibrated.right && isCalibrated.left,
        right: null,
        left: null
    };

    const limbs = [
        { name: 'right', s: 14, e: 16 }, // Right Elbow to Wrist
        { name: 'left', s: 13, e: 15 }   // Left Elbow to Wrist
    ];

    limbs.forEach(limb => {
        const start = landmarks[limb.s];
        const end = landmarks[limb.e];

        // 1. Calculate current 2D screen length
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const currentLength2D = Math.sqrt(dx * dx + dy * dy);

        // 2. Calibration: Capture the maximum length (The T-Pose moment)
        if (currentLength2D > maxLimbLength[limb.name]) {
            maxLimbLength[limb.name] = currentLength2D;
            // threshold to ensure it's a real limb detection
            if (currentLength2D > 0.12) { 
                isCalibrated[limb.name] = true;
            }
        }

        // 3. Infer Depth (Z) using the calibrated length
        // We assume: TotalLength^2 = dx^2 + dy^2 + dz^2
        let dz = 0;
        if (maxLimbLength[limb.name] > currentLength2D) {
            dz = Math.sqrt(Math.pow(maxLimbLength[limb.name], 2) - Math.pow(currentLength2D, 2));
        }

        // Use MediaPipe's raw Z to determine if wrist is in front or behind elbow
        const zSign = (end.z - start.z) > 0 ? 1 : -1;
        const finalDz = dz * zSign;

        // 4. HORIZONTAL PLANE (0-7)
        // atan2(dx, dz) aligns the depth axis with 0/4
        let hAngleRad = Math.atan2(dx, finalDz);
        let hAngleDeg = hAngleRad * (180 / Math.PI);
        
        // Mirror alignment: Pointing at camera = 0
        let calibratedH = (hAngleDeg + 180) % 360;
        let hPos = Math.round(calibratedH / 45) % 8;

        // 5. VERTICAL PLANE (0-4)
        // Angle relative to the downward vertical axis
        let vAngle = Math.atan2(Math.sqrt(dx*dx + finalDz*finalDz), dy) * (180 / Math.PI);
        let vPos = Math.round(vAngle / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        results[limb.name] = {
            h: hPos,
            v: vPos,
            calibrated: isCalibrated[limb.name]
        };
    });

    return results;
}
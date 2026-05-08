/**
 * EWMN Geometry Engine - Full Bilateral Version
 * Translates 3D Landmarks into Eshkol-Wachman Spherical Coordinates
 */

function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    const results = {};
    const limbs = [
        { name: 'right', s: 12, e: 14 }, // Right Shoulder to Elbow
        { name: 'left', s: 11, e: 13 }   // Left Shoulder to Elbow
    ];

    limbs.forEach(limb => {
        const shoulder = landmarks[limb.s];
        const elbow = landmarks[limb.e];

        // 1. CREATE VECTOR (Elbow relative to Shoulder)
        // We invert Z because MediaPipe Z-negative is "closer" to camera
        const dx = elbow.x - shoulder.x;
        const dy = elbow.y - shoulder.y;
        const dz = -(elbow.z - shoulder.z); 

        // 2. VERTICAL CALCULATION (0 to 4)
        // Angle relative to the downward vertical axis (0° = down, 180° = up)
        // We use Math.sqrt(dx*dx + dz*dz) to get the horizontal projection
        let vAngleRad = Math.atan2(Math.sqrt(dx * dx + dz * dz), dy);
        let vAngleDeg = vAngleRad * (180 / Math.PI);
        
        // Map 180 degrees into 5 positions (0, 1, 2, 3, 4)
        // 0 = Down, 2 = Horizontal, 4 = Up
        let vPos = Math.round(vAngleDeg / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        // 3. HORIZONTAL CALCULATION (0 to 7)
        // Angle on the XZ plane (The Floor Plane)
        // We add 90 degrees to align "0" with the front-facing camera view
        let hAngleRad = Math.atan2(dz, dx);
        let hAngleDeg = hAngleRad * (180 / Math.PI);
        
        // Offset Adjustment: This ensures pointing at the camera is 0
        // and pointing to the side is 2 (for Right) or 6 (for Left)
        let calibratedH = (hAngleDeg + 90) % 360;
        if (calibratedH < 0) calibratedH += 360;

        let hPos = Math.round(calibratedH / 45) % 8;

        results[limb.name] = { h: hPos, v: vPos };
    });

    return results;
}
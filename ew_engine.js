function calculateEWMN(landmarks) {
    if (!landmarks) return null;
    const results = {};
    const limbs = [
        { name: 'right', s: 14, e: 16, side: 1 }, // Right Elbow to Wrist
        { name: 'left', s: 13, e: 15, side: -1 }  // Left Elbow to Wrist
    ];

    limbs.forEach(limb => {
        const start = landmarks[limb.s];
        const end = landmarks[limb.e];

        // Vector calculation
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dz = end.z - start.z;

        // 1. VERTICAL (0-4)
        // 0 = Down, 2 = Horizontal, 4 = Up
        let vAngle = Math.atan2(Math.sqrt(dx*dx + dz*dz), dy) * (180 / Math.PI);
        let vPos = Math.round(vAngle / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        // 2. HORIZONTAL (0-7)
        // We use Math.atan2(dx, dz) to make Depth (Z) the primary axis (Front/Back)
        let hAngleRad = Math.atan2(dx, dz);
        let hAngleDeg = hAngleRad * (180 / Math.PI);

        // Adjusting for the mirror:
        // We want Diagonal Right to be 1 and Cross Center (Diagonal Left) to be 7.
        // We add 180 to shift the "Front" to 0.
        let calibratedH = (hAngleDeg + 180) % 360;
        
        // Final EWMN mapping:
        let hPos = Math.round(calibratedH / 45) % 8;

        results[limb.name] = { h: hPos, v: vPos };
    });
    return results;
}
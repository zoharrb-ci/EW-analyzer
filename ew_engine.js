function calculateEWMN(landmarks) {
    if (!landmarks) return null;
    const results = {};
    const limbs = [
        { name: 'right', s: 14, e: 16 }, // Right Elbow to Wrist
        { name: 'left', s: 13, e: 15 }   // Left Elbow to Wrist
    ];

    limbs.forEach(limb => {
        const start = landmarks[limb.s];
        const end = landmarks[limb.e];

        // Vector: Wrist relative to Elbow
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dz = end.z - start.z; // Depth

        // VERTICAL (0-4)
        // Angle relative to the downward vertical
        let vAngle = Math.atan2(Math.sqrt(dx*dx + dz*dz), dy) * (180 / Math.PI);
        let vPos = Math.round(vAngle / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        // HORIZONTAL (0-7)
        // Toward camera (negative Z in MediaPipe) should be 0.
        // Away from camera (positive Z) should be 4.
        let hAngle = Math.atan2(dz, dx) * (180 / Math.PI);
        
        // Calibration for front-facing orientation
        let calibratedH = (hAngle + 90) % 360;
        if (calibratedH < 0) calibratedH += 360;
        let hPos = Math.round(calibratedH / 45) % 8;

        results[limb.name] = { h: hPos, v: vPos };
    });
    return results;
}
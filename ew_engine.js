function calculateEWMN(landmarks) {
    if (!landmarks) return null;
    const results = {};
    const limbs = [
        { name: 'right', s: 12, e: 14 },
        { name: 'left', s: 11, e: 13 }
    ];

    limbs.forEach(limb => {
        const shoulder = landmarks[limb.s];
        const elbow = landmarks[limb.e];

        const dx = elbow.x - shoulder.x;
        const dy = elbow.y - shoulder.y;
        const dz = -(elbow.z - shoulder.z); // Invert Z for front-facing depth

        // Vertical (0-4)
        let vAngle = Math.atan2(Math.sqrt(dx*dx + dz*dz), dy) * (180 / Math.PI);
        let vPos = Math.round(vAngle / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        // Horizontal (0-7)
        let hAngle = Math.atan2(dz, dx) * (180 / Math.PI);
        let calibratedH = (hAngle + 90) % 360;
        if (calibratedH < 0) calibratedH += 360;
        let hPos = Math.round(calibratedH / 45) % 8;

        results[limb.name] = { h: hPos, v: vPos };
    });
    return results;
}
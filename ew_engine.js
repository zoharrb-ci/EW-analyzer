// EWMN Geometry Engine (Bilateral Update)
function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    const results = {};
    const limbs = [
        { name: 'right', s: 12, e: 14 }, // Right Shoulder/Elbow
        { name: 'left', s: 11, e: 13 }   // Left Shoulder/Elbow
    ];

    limbs.forEach(limb => {
        const shoulder = landmarks[limb.s];
        const elbow = landmarks[limb.e];

        // Vector: Elbow relative to Shoulder
        const dx = elbow.x - shoulder.x;
        const dy = elbow.y - shoulder.y;
        const dz = elbow.z - shoulder.z;

        // 1. VERTICAL (0-4)
        let vAngle = Math.atan2(Math.sqrt(dx*dx + dz*dz), dy) * (180 / Math.PI);
        let vPos = Math.round(vAngle / 45);
        vPos = Math.max(0, Math.min(4, vPos));

        // 2. HORIZONTAL (0-7) - Corrected Translation
        // We add 180 degrees to shift the "Front" (0) away from the back
        let hAngle = Math.atan2(dz, dx) * (180 / Math.PI);
        
        // Offset adjustment to align 0 with the front-facing camera axis
        hAngle = (hAngle + 270) % 360; 
        
        let hPos = Math.round(hAngle / 45) % 8;

        results[limb.name] = { h: hPos, v: vPos };
    });

    return results;
}
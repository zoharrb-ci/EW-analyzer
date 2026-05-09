function calculateEWMN(landmarks) {
    // 1. Establish the "Spine" (V4) as the vertical axis
    const shoulderMid = {
        x: (landmarks[11].x + landmarks[12].x) / 2,
        y: (landmarks[11].y + landmarks[12].y) / 2,
        z: (landmarks[11].z + landmarks[12].z) / 2
    };

    const processLimb = (proximal, distal) => {
        // Vector relative to the joint
        const dx = distal.x - proximal.x;
        const dy = distal.y - proximal.y;
        const dz = distal.z - proximal.z;

        // Calculate Vertical (v): 0 (down) to 4 (up)
        // dy is inverted in screen space (top is 0)
        const vRad = Math.atan2(Math.sqrt(dx*dx + dz*dz), -dy); 
        const vDeg = vRad * (180 / Math.PI);
        const vPos = Math.round(vDeg / 45); // Standard scale 1=45°

        // Calculate Horizontal (h): 0 to 7
        const hRad = Math.atan2(dz, dx);
        let hDeg = hRad * (180 / Math.PI);
        if (hDeg < 0) hDeg += 360;
        const hPos = Math.round(hDeg / 45) % 8;

        return { h: hPos, v: vPos, deg: `${Math.round(hDeg)}°|${Math.round(vDeg)}°` };
    };

    return {
        right: processLimb(landmarks[12], landmarks[16]), // Shoulder to Wrist
        left: processLimb(landmarks[11], landmarks[15])
    };
}
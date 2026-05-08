// EWMN Geometry Engine
function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    // Identify Right Shoulder (12) and Right Elbow (14)
    const shoulder = landmarks[12];
    const elbow = landmarks[14];

    // Calculate Vector
    const dx = elbow.x - shoulder.x;
    const dy = elbow.y - shoulder.y;
    const dz = elbow.z - shoulder.z;

    // 1. VERTICAL CALCULATION (0-4)
    // Angle relative to the downward vertical axis
    let vAngle = Math.atan2(Math.sqrt(dx*dx + dz*dz), dy) * (180 / Math.PI);
    let vPos = Math.round(vAngle / 45); // Map to 0-4 scale
    vPos = Math.max(0, Math.min(4, vPos));

    // 2. HORIZONTAL CALCULATION (0-7)
    // Angle on the XZ plane
    let hAngle = Math.atan2(dz, dx) * (180 / Math.PI);
    if (hAngle < 0) hAngle += 360;
    let hPos = Math.round(hAngle / 45) % 8; // Map to 0-7 scale

    return { h: hPos, v: vPos };
}
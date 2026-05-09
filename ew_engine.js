/**
 * EWMN Proportional Engine 
 * Features: Dynamic scaling, off-center compensation, and kinematic filtering.
 */

let sorMode = "absolute";
let dynamicScale = 1.0; 
const SMOOTH_FACTOR = 0.65;

const smoothedData = {
    right: { dx: 0, dy: 0, dz: 0 },
    left:  { dx: 0, dy: 0, dz: 0 },
    scale: 1.0
};

function toggleSoR() {
    sorMode = (sorMode === "absolute") ? "bodywise" : "absolute";
    return sorMode;
}

/**
 * Calculates a scale factor based on the 3D distance between shoulders.
 * This acts as the "unit length" for the System of Reference.
 */
function getDynamicScale(landmarks) {
    const sL = landmarks[11];
    const sR = landmarks[12];
    
    // 3D Euclidean distance between shoulders
    const dist = Math.sqrt(
        Math.pow(sL.x - sR.x, 2) + 
        Math.pow(sL.y - sR.y, 2) + 
        Math.pow(sL.z - sR.z, 2)
    );

    // Smooth the scale to prevent UI "pumping"
    smoothedData.scale = (dist * (1 - 0.9)) + (smoothedData.scale * 0.9);
    return smoothedData.scale;
}

function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    const shoulderL = landmarks[11];
    const shoulderR = landmarks[12];
    const currentScale = getDynamicScale(landmarks);

    // Body Midpoint (The origin for the SoR)
    const originX = (shoulderL.x + shoulderR.x) / 2;
    const originY = (shoulderL.y + shoulderR.y) / 2;
    const originZ = (shoulderL.z + shoulderR.z) / 2;

    // Body Orientation for Body-wise SoR
    const bodyAzimuth = Math.atan2(shoulderR.x - shoulderL.x, shoulderR.z - shoulderL.z);
    const frontOffset = bodyAzimuth + (Math.PI / 2);

    const results = { 
        sorMode: sorMode, 
        scale: currentScale,
        origin: { x: originX, y: originY },
        right: null, 
        left: null 
    };

    const limbs = [{ name: 'right', s: 14, e: 16 }, { name: 'left', s: 13, e: 15 }];

    limbs.forEach(limb => {
        const joint = landmarks[limb.s];
        const extremity = landmarks[limb.e];

        // 1. Raw Vectors relative to the Joint (Not the screen)
        let raw_dx = (extremity.x - joint.x);
        let raw_dy = (extremity.y - joint.y);
        let raw_dz = (extremity.z - joint.z);

        // 2. Kinematic Smoothing
        let sData = smoothedData[limb.name];
        sData.dx = (raw_dx * (1 - SMOOTH_FACTOR)) + (sData.dx * SMOOTH_FACTOR);
        sData.dy = (raw_dy * (1 - SMOOTH_FACTOR)) + (sData.dy * SMOOTH_FACTOR);
        sData.dz = (raw_dz * (1 - SMOOTH_FACTOR)) + (sData.dz * SMOOTH_FACTOR);

        // 3. Normalization: Divide by scale so movement distance doesn't affect notation
        const dx = sData.dx / currentScale;
        const dy = sData.dy / currentScale;
        const dz = sData.dz / currentScale;

        // --- HORIZONTAL (0-7) ---
        let hRad = Math.atan2(-dx, -dz);
        if (sorMode === "bodywise") hRad -= frontOffset;
        let hDeg = (hRad * (180 / Math.PI) + 360) % 360;
        let hPos = Math.round(hDeg / 45) % 8;

        // --- VERTICAL (0=Nadir, 2=Horizontal, 4=Zenith) ---
        const horizontalDist = Math.sqrt(dx*dx + dz*dz);
        let vDeg = Math.atan2(-dy, horizontalDist) * (180 / Math.PI) + 90;
        let vPos = Math.max(0, Math.min(4, Math.round(vDeg / 45)));

        results[limb.name] = {
            ewmn: { h: hPos, v: vPos, hDeg: Math.round(hDeg), vDeg: Math.round(vDeg) },
            depth: dz.toFixed(2)
        };
    });

    return results;
}
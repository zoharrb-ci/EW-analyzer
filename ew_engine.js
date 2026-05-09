/**
 * EWMN Engine with SoR Toggle Support
 */

let sorMode = "absolute"; // Global state

function toggleSoR() {
    const btn = document.getElementById('sorToggle');
    sorMode = (sorMode === "absolute") ? "bodywise" : "absolute";
    btn.innerText = `Current SoR: ${sorMode.toUpperCase()}`;
}

function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    // Calculate Body Orientation for Body-wise SoR
    // Using shoulders (11, 12) to determine the "Front" of the mover
    const shoulderL = landmarks[11];
    const shoulderR = landmarks[12];
    
    // Vector representing the chest plane
    const bodyAzimuth = Math.atan2(shoulderR.x - shoulderL.x, shoulderR.z - shoulderL.z);
    // Offset by 90 degrees to get the perpendicular "Front"
    const frontOffset = bodyAzimuth + (Math.PI / 2);

    const results = { sorMode: sorMode, right: null, left: null };
    const limbs = [{ name: 'right', s: 12, e: 16 }, { name: 'left', s: 11, e: 15 }];

    limbs.forEach(limb => {
        const joint = landmarks[limb.s];
        const extremity = landmarks[limb.e];

        const dx = extremity.x - joint.x;
        const dy = extremity.y - joint.y;
        const dz = extremity.z - joint.z;

        // --- HORIZONTAL CALCULATION ---
        let hRad = Math.atan2(-dx, -dz);
        
        // If Body-wise, subtract the body's rotation from the limb's rotation
        if (sorMode === "bodywise") {
            hRad -= frontOffset;
        }

        let hDeg = (hRad * (180 / Math.PI) + 360) % 360;
        let hPos = Math.round(hDeg / 45) % 8;

        // --- VERTICAL CALCULATION (0=Floor, 4=Ceiling) ---
        const horizontalDist = Math.sqrt(dx*dx + dz*dz);
        let vDeg = Math.atan2(-dy, horizontalDist) * (180 / Math.PI) + 90;
        let vPos = Math.max(0, Math.min(4, Math.round(vDeg / 45)));

        results[limb.name] = {
            vector: { x: dx.toFixed(2), y: dy.toFixed(2), z: dz.toFixed(2) },
            ewmn: { h: hPos, v: vPos, hDeg: Math.round(hDeg), vDeg: Math.round(vDeg) }
        };
    });

    return results;
}
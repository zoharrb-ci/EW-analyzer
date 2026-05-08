/**
 * EWMN Advanced Kinematic Engine 
 */

const CONSTRAINTS = {
    forearm_max_v: 180, // Cannot go past ceiling
    forearm_min_v: 0,   // Cannot go through floor
    shoulder_width_ratio: 0.2 // Used to stabilize the central matrix
};

let maxLimbLength = { right: 0.1, left: 0.1 };

function calculateEWMN(landmarks) {
    if (!landmarks) return null;

    // Create a Body Matrix Origin (Midpoint between shoulders)
    const bodyCenter = {
        x: (landmarks[11].x + landmarks[12].x) / 2,
        y: (landmarks[11].y + landmarks[12].y) / 2,
        z: (landmarks[11].z + landmarks[12].z) / 2
    };

    const results = { right: null, left: null, center: bodyCenter };
    const limbs = [{ name: 'right', s: 14, e: 16 }, { name: 'left', s: 13, e: 15 }];

    limbs.forEach(limb => {
        const start = landmarks[limb.s];
        const end = landmarks[limb.e];

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dz_raw = end.z - start.z;

        const currentLength2D = Math.sqrt(dx * dx + dy * dy);
        if (currentLength2D > maxLimbLength[limb.name]) maxLimbLength[limb.name] = currentLength2D;

        let dz = 0;
        const L = maxLimbLength[limb.name];
        if (L > currentLength2D) {
            dz = Math.sqrt(Math.pow(L, 2) - Math.pow(dx, 2) - Math.pow(dy, 2)) || 0;
        }
        const finalDz = (dz_raw > 0) ? dz : -dz;

        // --- VERTICAL LOGIC (Floor = 0) ---
        let vAngleRaw = Math.atan2(-dy, Math.sqrt(dx*dx + finalDz*finalDz)) * (180 / Math.PI) + 90;
        
        // Apply Kinematic Constraint: Clamp to humanly possible range
        let vAngleCapped = Math.max(CONSTRAINTS.forearm_min_v, Math.min(CONSTRAINTS.forearm_max_v, vAngleRaw));

        // --- HORIZONTAL LOGIC (Camera = 0) ---
        let hAngleRaw = (Math.atan2(dx, -finalDz) * (180 / Math.PI) + 180) % 360;

        // --- HEAVY VS LIGHT PARAMETER ---
        // Heavy = moving toward floor/center (dy > 0), Light = moving away/up (dy < 0)
        const weight = dy > 0.05 ? "HEAVY" : (dy < -0.05 ? "LIGHT" : "NEUTRAL");

        results[limb.name] = {
            h: Math.round(hAngleRaw / 45) % 8,
            v: Math.round(vAngleCapped / 45),
            hDeg: Math.round(hAngleRaw),
            vDeg: Math.round(vAngleCapped),
            weight: weight
        };
    });

    return results;
}
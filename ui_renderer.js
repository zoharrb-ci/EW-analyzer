/**
 * UI Renderer - Bilateral & Polarity Visualization
 */

function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    const statusDiv = document.getElementById('status');

    if (ewData) {
        if (ewData.allCalibrated) {
            statusDiv.innerHTML = "STATUS: <span style='color:#0f0'>CALIBRATED</span>";
        }

        if (ewData.right) {
            rDiv.innerHTML = `<span style="color:#FF0000">R: H${ewData.right.h} V${ewData.right.v} | ${ewData.right.weight}</span>`;
        }
        if (ewData.left) {
            lDiv.innerHTML = `<span style="color:#FFFF00">L: H${ewData.left.h} V${ewData.left.v} | ${ewData.left.weight}</span>`;
        }
    }
}

function drawScene(results, ctx, canvas, ewData) {
    if (!results) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    if (results.poseLandmarks && ewData) {
        // Subtle full skeleton background
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#ffffff22', lineWidth: 1});

        // DRAW MEASURED LIMBS
        const limbs = [
            {data: ewData.right, color: '#FF0000', s: 14, e: 16}, // Right
            {data: ewData.left, color: '#FFFF00', s: 13, e: 15}   // Left
        ];

        limbs.forEach(limb => {
            if (!limb.data) return;
            const s = results.poseLandmarks[limb.s];
            const e = results.poseLandmarks[limb.e];

            // 1. Draw the limb segment
            ctx.beginPath();
            ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
            ctx.lineTo(e.x * canvas.width, e.y * canvas.height);
            ctx.strokeStyle = limb.color;
            ctx.lineWidth = 6;
            ctx.stroke();

            // 2. HIGHLIGHT THE "HEAVY" SUPPORT JOINT
            // If isBase is true (palm on floor), circle the wrist. Otherwise, circle the elbow.
            const heavyJoint = limb.data.isBase ? e : s;
            ctx.beginPath();
            ctx.arc(heavyJoint.x * canvas.width, heavyJoint.y * canvas.height, 15, 0, 2 * Math.PI);
            ctx.strokeStyle = '#00FFFF'; // Cyan circle for support source
            ctx.lineWidth = 3;
            ctx.stroke();
        });

        // Joint dots
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 1, radius: 2});
    }
    ctx.restore();
}
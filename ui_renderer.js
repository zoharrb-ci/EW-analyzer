/**
 * UI Renderer - Minimalist Data Display
 */

function updateHUD(ewData) {
    const displayDiv = document.getElementById('data_display');
    if (!ewData) return;

    displayDiv.innerHTML = `
        <div style="background: rgba(0,0,0,0.7); color: white; padding: 10px; font-family: monospace;">
            <table style="width:100%; border-bottom: 1px solid #444; margin-bottom: 10px;">
                <tr><th colspan="4" style="text-align:left;">PHYSICS (Vector Δ)</th></tr>
                <tr style="opacity:0.7;"><td>Limb</td><td>X</td><td>Y</td><td>Z</td></tr>
                <tr><td>Right</td><td>${ewData.right.vector.x}</td><td>${ewData.right.vector.y}</td><td>${ewData.right.vector.z}</td></tr>
                <tr><td>Left</td><td>${ewData.left.vector.x}</td><td>${ewData.left.vector.y}</td><td>${ewData.left.vector.z}</td></tr>
            </table>

            <table style="width:100%; color: #00ffcc;">
                <tr><th colspan="3" style="text-align:left;">NOTATION (${ewData.sorMode})</th></tr>
                <tr style="opacity:0.7;"><td>Limb</td><td>(h) (v)</td><td>Raw Deg</td></tr>
                <tr><td>Right</td><td>(${ewData.right.ewmn.h}) (${ewData.right.ewmn.v})</td><td>${ewData.right.ewmn.hDeg}°|${ewData.right.ewmn.vDeg}°</td></tr>
                <tr><td>Left</td><td>(${ewData.left.ewmn.h}) (${ewData.left.ewmn.v})</td><td>${ewData.left.ewmn.hDeg}°|${ewData.left.ewmn.vDeg}°</td></tr>
            </table>
        </div>
    `;
}

function drawScene(results, ctx, canvas, ewData) {
    if (!results) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    if (results.poseLandmarks && ewData) {
        const limbs = [
            {data: ewData.right, color: '#FF0000', s: 14, e: 16},
            {data: ewData.left, color: '#FFFF00', s: 13, e: 15}
        ];

        limbs.forEach(limb => {
            if (!limb.data) return;
            const s = results.poseLandmarks[limb.s];
            const e = results.poseLandmarks[limb.e];

            // Limb vector
            ctx.beginPath();
            ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
            ctx.lineTo(e.x * canvas.width, e.y * canvas.height);
            ctx.strokeStyle = limb.color;
            ctx.lineWidth = 6;
            ctx.stroke();

            // Heavy Polarity Highlight
            const heavyJoint = limb.data.isBase ? e : s;
            ctx.beginPath();
            ctx.arc(heavyJoint.x * canvas.width, heavyJoint.y * canvas.height, 15, 0, 2 * Math.PI);
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    }
    ctx.restore();
}
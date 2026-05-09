/**
 * UI_RENDERER.JS - Visualization and Table Updates
 */
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');

pose.onResults((res) => {
    if (!res.poseLandmarks) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);

    const lm = res.poseLandmarks;
    const data = calculateEWMN(lm);
    handleGestures(lm);
    updateHUD(data);

    // 1. Spine Axis Arrow
    const sMid = { x: (lm[11].x + lm[12].x)/2 * canvas.width, y: (lm[11].y + lm[12].y)/2 * canvas.height };
    ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sMid.x, sMid.y); ctx.lineTo(sMid.x, sMid.y - 100); ctx.stroke();

    // 2. Body-wise 0 Arrow (Floor)
    const fMid = { x: (lm[23].x + lm[24].x)/2 * canvas.width, y: (lm[23].y + lm[24].y)/2 * canvas.height + 50 };
    ctx.strokeStyle = '#fff'; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(fMid.x, fMid.y); ctx.lineTo(fMid.x, fMid.y + 80); ctx.stroke();
    ctx.setLineDash([]);

    // 3. Tracing Memory
    if (isTracking) {
        rPath.push({x: lm[16].x * canvas.width, y: lm[16].y * canvas.height});
        lPath.push({x: lm[15].x * canvas.width, y: lm[15].y * canvas.height});
    }

    // 4. Render Layers
    ctx.globalAlpha = document.getElementById('opacity-slider').value;
    const drawP = (p, c) => {
        if(p.length < 2) return;
        ctx.beginPath(); ctx.strokeStyle = c; ctx.lineWidth = 4;
        ctx.moveTo(p[0].x, p[0].y);
        for(let pt of p) ctx.lineTo(pt.x, pt.y); ctx.stroke();
    };
    drawP(rPath, '#ff4444'); drawP(lPath, '#ffee00');

    // Reset Alpha for Limb Axes
    ctx.globalAlpha = 1;
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ff4444'; ctx.beginPath(); ctx.moveTo(lm[12].x*canvas.width, lm[12].y*canvas.height); ctx.lineTo(lm[16].x*canvas.width, lm[16].y*canvas.height); ctx.stroke();
    ctx.strokeStyle = '#ffee00'; ctx.beginPath(); ctx.moveTo(lm[11].x*canvas.width, lm[11].y*canvas.height); ctx.lineTo(lm[15].x*canvas.width, lm[15].y*canvas.height); ctx.stroke();

    ctx.restore();
});

function updateHUD(data) {
    document.getElementById('th-val').innerText = `H${data.torso.h}`;
    document.getElementById('t-deg').innerText = `${data.torso.deg}°`;
    document.getElementById('rh-val').innerText = `H${data.right.h}`;
    document.getElementById('rv-val').innerText = `V${data.right.v}`;
    document.getElementById('r-deg').innerText = `${data.right.degH}° / ${data.right.degV}°`;
    document.getElementById('lh-val').innerText = `H${data.left.h}`;
    document.getElementById('lv-val').innerText = `V${data.left.v}`;
    document.getElementById('l-deg').innerText = `${data.left.degH}° / ${data.left.degV}°`;
    document.getElementById('rec-dot').className = isTracking ? 'dot rec-active' : 'dot';
}
/**
 * UI_RENDERER.JS
 * Canvas Drawing and HTML HUD updates
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

    // Update HUD
    document.getElementById('rh').innerText = `H${data.right.h}`;
    document.getElementById('rv').innerText = `V${data.right.v}`;
    document.getElementById('lh').innerText = `H${data.left.h}`;
    document.getElementById('lv').innerText = `V${data.left.v}`;
    document.getElementById('rec-dot').className = isTracking ? 'dot rec-active' : 'dot';

    // Store Paths
    if (isTracking) {
        rPath.push({x: lm[16].x * canvas.width, y: lm[16].y * canvas.height});
        lPath.push({x: lm[15].x * canvas.width, y: lm[15].y * canvas.height});
    }

    // Render Traces
    ctx.globalAlpha = document.getElementById('opacity-slider').value;
    ctx.lineWidth = 4;
    const drawP = (p, c) => {
        if(p.length < 2) return;
        ctx.beginPath(); ctx.strokeStyle = c;
        ctx.moveTo(p[0].x, p[0].y);
        for(let pt of p) ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
    };
    drawP(rPath, '#ff4444'); drawP(lPath, '#ffee00');

    // Draw Limb Lines
    ctx.globalAlpha = 1; ctx.lineWidth = 6;
    ctx.strokeStyle = '#ff4444'; ctx.beginPath(); ctx.moveTo(lm[12].x*canvas.width, lm[12].y*canvas.height); ctx.lineTo(lm[16].x*canvas.width, lm[16].y*canvas.height); ctx.stroke();
    ctx.strokeStyle = '#ffee00'; ctx.beginPath(); ctx.moveTo(lm[11].x*canvas.width, lm[11].y*canvas.height); ctx.lineTo(lm[15].x*canvas.width, lm[15].y*canvas.height); ctx.stroke();
    
    ctx.restore();
});
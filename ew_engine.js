<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EWMN Gestural Analyzer</title>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
    
    <style>
        body { margin: 0; background: #000; color: #00ffcc; font-family: 'Courier New', monospace; overflow: hidden; }
        canvas { width: 100vw; height: 100vh; transform: scaleX(-1); position: absolute; top: 0; left: 0; }
        #ui-overlay { position: relative; z-index: 10; pointer-events: none; height: 100vh; padding: 20px; }
        
        #start-prompt { 
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            pointer-events: auto; padding: 20px 40px; background: #00ffcc; color: #000;
            font-weight: bold; cursor: pointer; border: none; border-radius: 5px; font-size: 1.2em;
        }

        .panel { background: rgba(0, 15, 20, 0.9); border: 1px solid #00ffcc; padding: 15px; pointer-events: auto; border-radius: 4px; }
        #status-bar { display: flex; align-items: center; font-size: 14px; margin-bottom: 20px; }
        .dot { height: 12px; width: 12px; border-radius: 50%; background: #444; margin-right: 10px; }
        .rec-active { background: #ff0000; box-shadow: 0 0 10px #ff0000; animation: blink 1s infinite; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; font-size: 10px; color: #008888; border-bottom: 1px solid #004444; }
        td { padding: 8px 0; font-size: 22px; font-weight: bold; color: #fff; }
        
        #controls { position: absolute; bottom: 40px; left: 20px; width: 300px; }
        .btn-group { display: flex; gap: 5px; margin-top: 10px; }
        button { background: transparent; border: 1px solid #00ffcc; color: #00ffcc; padding: 10px; cursor: pointer; font-family: inherit; flex: 1; }
        button:hover { background: rgba(0, 255, 204, 0.2); }
        input[type=range] { width: 100%; accent-color: #00ffcc; cursor: pointer; }

        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
    </style>
</head>
<body>

    <canvas id="output_canvas"></canvas>
    <video id="input_video" style="display:none;"></video>
    
    <button id="start-prompt" onclick="initEngine()">ACTIVATE EWMN SYSTEM</button>

    <div id="ui-overlay">
        <div id="status-bar">
            <div class="dot" id="rec-dot"></div>
            <div id="status-text">OFFLINE</div>
        </div>

        <div id="notation-matrix" class="panel" style="width: 280px; position: absolute; top: 20px; right: 20px;">
            <div style="font-size: 11px;">ABS-SPACEWISE SCORE</div>
            <table>
                <thead><tr><th>LIMB</th><th>H</th><th>V</th><th>DEG</th></tr></thead>
                <tbody>
                    <tr><td style="color:#ff4444">R.ARM</td><td id="rh">-</td><td id="rv">-</td><td id="rd">-</td></tr>
                    <tr><td style="color:#ffee00">L.ARM</td><td id="lh">-</td><td id="lv">-</td><td id="ld">-</td></tr>
                </tbody>
            </table>
            <div style="font-size: 9px; margin-top: 10px; color: #008888;">
                GESTURES: [👍 REC] [👎 STOP] [👏 RESET]
            </div>
        </div>

        <div id="controls" class="panel">
            <label style="font-size: 10px; letter-spacing: 1px;">TRACE OPACITY</label>
            <input type="range" id="opacity-slider" min="0.1" max="1" step="0.1" value="0.6">
            <div class="btn-group">
                <button onclick="isTracking = true">START</button>
                <button onclick="isTracking = false">STOP</button>
                <button onclick="clearTraces()">RESET</button>
            </div>
        </div>
    </div>

    <script>
        const videoElement = document.getElementById('input_video');
        const canvasElement = document.getElementById('output_canvas');
        const ctx = canvasElement.getContext('2d');
        const statusText = document.getElementById('status-text');
        const recDot = document.getElementById('rec-dot');
        const opacitySlider = document.getElementById('opacity-slider');

        let isTracking = false;
        let rightPath = [];
        let leftPath = [];

        function initEngine() {
            document.getElementById('start-prompt').style.display = 'none';
            statusText.innerText = "SENSORS INITIALIZING...";
            camera.start();
        }

        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true });

        function calculateEWMN(lm) {
            const processLimb = (prox, dist, isRight) => {
                const dx = dist.x - prox.x;
                const dy = dist.y - prox.y;
                const dz = dist.z - prox.z;

                // Vertical (V): 0=Down, 2=Horiz, 4=Up
                const vRad = Math.atan2(Math.sqrt(dx*dx + dz*dz), -dy); 
                const vDeg = vRad * (180 / Math.PI);
                const vPos = Math.max(0, Math.min(4, Math.round(vDeg / 45)));

                // Horizontal (H): 0=Forward, 2=Right, 4=Back, 6=Left
                // We use dz (depth) and dx (width)
                let hRad = Math.atan2(dz, dx);
                let hDeg = hRad * (180 / Math.PI) + 90; // Offset for H0 = Forward
                if (hDeg < 0) hDeg += 360;
                const hPos = Math.round(hDeg / 45) % 8;

                return { h: hPos, v: vPos, deg: `${Math.round(hDeg)}°|${Math.round(vDeg)}°` };
            };

            return {
                right: processLimb(lm[12], lm[16], true),
                left: processLimb(lm[11], lm[15], false)
            };
        }

        function checkGestures(lm) {
            // 1. Right Thumb Gesture (Thumb Tip 22 vs Thumb IP 21)
            const rThumbTip = lm[22];
            const rThumbBase = lm[21];
            const rWrist = lm[16];

            if (rThumbTip.y < rThumbBase.y - 0.05) isTracking = true;  // Thumb Up
            if (rThumbTip.y > rThumbBase.y + 0.05) isTracking = false; // Thumb Down

            // 2. Clap Detection (Wrist 15 to Wrist 16)
            const dist = Math.hypot(lm[15].x - lm[16].x, lm[15].y - lm[16].y);
            if (dist < 0.08) clearTraces();
        }

        function clearTraces() {
            rightPath = [];
            leftPath = [];
        }

        pose.onResults((results) => {
            if (!results.image) return;
            statusText.innerText = isTracking ? "RECORDING PATH..." : "SYSTEM READY";
            isTracking ? recDot.classList.add('rec-active') : recDot.classList.remove('rec-active');

            canvasElement.width = window.innerWidth;
            canvasElement.height = window.innerHeight;

            ctx.save();
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            if (results.poseLandmarks) {
                const lm = results.poseLandmarks;
                const data = calculateEWMN(lm);
                checkGestures(lm);

                // Update Table
                document.getElementById('rh').innerText = data.right.h;
                document.getElementById('rv').innerText = data.right.v;
                document.getElementById('rd').innerText = data.right.deg;
                document.getElementById('lh').innerText = data.left.h;
                document.getElementById('lv').innerText = data.left.v;
                document.getElementById('ld').innerText = data.left.deg;

                // Tracing Logic
                if (isTracking) {
                    rightPath.push({x: lm[16].x * canvasElement.width, y: lm[16].y * canvasElement.height});
                    leftPath.push({x: lm[15].x * canvasElement.width, y: lm[15].y * canvasElement.height});
                }

                drawVisuals(lm);
            }
            ctx.restore();
        });

        function drawVisuals(lm) {
            const w = canvasElement.width;
            const h = canvasElement.height;
            const alpha = opacitySlider.value;

            // Draw Paths
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.globalAlpha = alpha;

            const drawPath = (path, color) => {
                if (path.length < 2) return;
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.moveTo(path[0].x, path[0].y);
                for(let p of path) ctx.lineTo(p.x, p.y);
                ctx.stroke();
            };

            drawPath(rightPath, '#ff4444');
            drawPath(leftPath, '#ffee00');

            // Draw Limb Vectors
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 5;
            // Right Arm
            ctx.strokeStyle = '#ff4444';
            ctx.beginPath();
            ctx.moveTo(lm[12].x * w, lm[12].y * h);
            ctx.lineTo(lm[16].x * w, lm[16].y * h);
            ctx.stroke();
            // Left Arm
            ctx.strokeStyle = '#ffee00';
            ctx.beginPath();
            ctx.moveTo(lm[11].x * w, lm[11].y * h);
            ctx.lineTo(lm[15].x * w, lm[15].y * h);
            ctx.stroke();
        }

        const camera = new Camera(videoElement, {
            onFrame: async () => { await pose.send({image: videoElement}); },
            width: 1280, height: 720
        });
    </script>
</body>
</html>
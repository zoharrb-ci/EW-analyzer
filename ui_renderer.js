function updateHUD(ewData) {
    const rDiv = document.getElementById('r_hand');
    const lDiv = document.getElementById('l_hand');
    const statusDiv = document.getElementById('status');

    if (!ewData.right.calibrated || !ewData.left.calibrated) {
        statusDiv.innerHTML = "STATUS: <span style='color:orange'>CALIBRATING... STAND IN T-POSE</span>";
        statusDiv.style.border = "1px solid orange";
    } else {
        statusDiv.innerHTML = "STATUS: <span style='color:#0f0'>CALIBRATED & TRACKING</span>";
        statusDiv.style.border = "1px solid #0f0";
    }

    if (ewData.right) {
        const rColor = ewData.right.calibrated ? "#0f0" : "#ffae00";
        rDiv.innerHTML = `<span style="color:${rColor}">R-ARM: H ${ewData.right.h} | V ${ewData.right.v}</span>`;
    }
    if (ewData.left) {
        const lColor = ewData.left.calibrated ? "#0f0" : "#ffae00";
        lDiv.innerHTML = `<span style="color:${lColor}">L-ARM: H ${ewData.left.h} | V ${ewData.left.v}</span>`;
    }
}
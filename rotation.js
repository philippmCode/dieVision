const btn = document.getElementById("request");
btn.addEventListener("click", permission);

function permission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    let startOrientation = null;

                    window.addEventListener("deviceorientation", (event) => {
                        let alpha = event.alpha;  // Z-axis
                        let beta = event.beta;    // X-axis
                        let gamma = event.gamma;  // Y-axis

                        displayOrientationData(alpha, beta, gamma);

                        // initial orientation is set if not set already
                        if (startOrientation === null) {
                            startOrientation = alpha;
                            displayStartingPoint(startOrientation);
                        }
                        
                        // change of rotation
                        let rotation = alpha - startOrientation;

                        // rotation has to be positive
                        if (rotation < 0) {
                            rotation += 360;
                        }

                        displayRotationData(rotation);
                        // Berechnet die horizontale Verschiebung des Bildes. 
                        // Du kannst alpha von 0 bis 360 Grad auf einen Bereich von -50% bis 50% (z.B. für das Background-Position) abbilden.
                        const shift = ((360 - alpha) / 360) * 100 - 50;  // alpha von 0 bis 360 wird in Prozent (-50% bis 50%) umgerechnet

                        // Setzt die Hintergrundposition basierend auf der Drehung des Geräts
                        container.style.backgroundPositionX = `${shift}%`;
                    });
                }
            })
            .catch(console.error);
    } else {
        alert("DeviceMotionEvent is not defined for this device");
    }
}

function displayStartingPoint(start) {
    document.getElementById('start').innerText = start !== null ? start.toFixed(2) : '-';
}

function displayRotationData(rotation) {
    document.getElementById('rotation').innerText = rotation !== null ? rotation.toFixed(2) : '-';
}

function displayOrientationData(alpha, beta, gamma) {
    document.getElementById('alpha').innerText = alpha !== null ? alpha.toFixed(2) : '-';
    document.getElementById('beta').innerText = beta !== null ? beta.toFixed(2) : '-';
    document.getElementById('gamma').innerText = gamma !== null ? gamma.toFixed(2) : '-';
}

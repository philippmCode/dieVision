const btn = document.getElementById("request");
btn.addEventListener("click", permission);

function permission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    let startOrientation = null;

                    window.addEventListener("deviceorientation", (event) => {
                        let alpha = event.alpha;
                        let beta = event.beta;    
                        let gamma = event.gamma;

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
                        // calculates the horizontal shift in percent based on the rotation
                        const shift = (rotation / 360) * 100;

                        // Setzt die Hintergrundposition basierend auf der Drehung des Geräts
                        container.style.backgroundPositionX = `${-shift}%`;
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

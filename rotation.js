const btn = document.getElementById("request");
btn.addEventListener("click", permission);

function permission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    let startOrientation = null;

                    window.addEventListener("deviceorientation", (event) => {
                        let alpha = event.alpha;  // Drehung um die Z-Achse
                        let beta = event.beta;    // Neigung um die X-Achse
                        let gamma = event.gamma;  // Neigung um die Y-Achse

                        // Orientierungsdaten anzeigen
                        displayOrientationData(alpha, beta, gamma);

                        // Initiale Orientierung setzen, wenn noch nicht gesetzt
                        if (startOrientation === null) {
                            startOrientation = alpha;
                            displayStartingPoint(startOrientation);
                        }
                        
                        // Berechnung der Rotationsänderung
                        let rotation = alpha - startOrientation;

                        // Sicherstellen, dass rotation positiv bleibt
                        if (rotation < 0) {
                            rotation += 360;
                        }

                        // Rotation anzeigen
                        displayRotationData(rotation);
                        rotatePanorama(alpha, startOrientation);
                    });
                }
            })
            .catch(console.error);
    } else {
        alert("DeviceMotionEvent is not defined");
    }
}

function rotatePanorama(alpha, startOrientation) {
    const panorama = document.getElementById('panorama');

    // Die Drehung berechnen
    const rotation = alpha - startOrientation;

    // Sicherstellen, dass die Rotation positiv bleibt
    const correctedRotation = rotation < 0 ? rotation + 360 : rotation;

    // Setze die Drehung des inneren Panoramas
    panorama.style.transform = `rotate(${correctedRotation}deg)`;
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

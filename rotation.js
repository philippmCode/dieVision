function permission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", (event) => {
                        // Holen der Drehungswerte (Alpha, Beta, Gamma)
                        let alpha = event.alpha;  // Drehung um die Z-Achse (Winkel auf der Oberfläche)
                        let beta = event.beta;    // Drehung um die X-Achse (Neigung des Geräts)
                        let gamma = event.gamma;  // Drehung um die Y-Achse (Neigung des Geräts)

                        displayOrientationData(alpha, beta, gamma);

                        // Wende die Drehung des Bildes basierend auf dem Alpha-Wert (Z-Achse) an
                        if (alpha !== null) {
                            // Drehe das Bild entlang der Y-Achse, sodass es wie ein Panorama aussieht
                            // Die Rotation entlang der Y-Achse erzeugt den 3D-Effekt des "Umwickelns"
                            let rotation = alpha; // Alpha gibt die Drehung um die Z-Achse (horizontal)
                            document.getElementById('image').style.transform = 'translateX(-50%) rotateY(' + rotation + 'deg)';
                        }
                    });
                }
            })
            .catch(console.error);
    } else {
        alert("DeviceMotionEvent is not defined");
    }
}

const btn = document.getElementById("request");
btn.addEventListener("click", permission);

function displayOrientationData(alpha, beta, gamma) {
    document.getElementById('alpha').innerText = alpha !== null ? alpha.toFixed(2) : '-';
    document.getElementById('beta').innerText = beta !== null ? beta.toFixed(2) : '-';
    document.getElementById('gamma').innerText = gamma !== null ? gamma.toFixed(2) : '-';
}
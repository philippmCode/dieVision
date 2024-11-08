const btn = document.getElementById("request");
btn.addEventListener("click", permission);

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

                        rotate();
                    });
                }
            })
            .catch(console.error);
    } else {
        alert("DeviceMotionEvent is not defined");
    }
}

function rotate() {

    let startOrientation = null;
            let panorama = document.getElementById("panorama");
            let imageWidth = panorama.offsetWidth; // Breite des Panoramabildes in Pixel

            window.addEventListener("deviceorientation", (event) => {
                if (startOrientation === null) {
                    // Initiale Orientierung speichern
                    startOrientation = event.alpha;
                }
                
                // Die Rotationsänderung berechnen
                let rotation = event.alpha - startOrientation;

                displayOrientationData(rotation);                
            });
}

function displayOrientationData(text) {
    document.getElementById('rotation').innerText = text;
}

function displayOrientationData(alpha, beta, gamma) {
    document.getElementById('alpha').innerText = alpha !== null ? alpha.toFixed(2) : '-';
    document.getElementById('beta').innerText = beta !== null ? beta.toFixed(2) : '-';
    document.getElementById('gamma').innerText = gamma !== null ? gamma.toFixed(2) : '-';
}
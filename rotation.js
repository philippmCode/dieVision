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
                        rotatePanorama(alpha);
                    });
                }
            })
            .catch(console.error);
    } else {
        alert("DeviceMotionEvent is not defined for this device.");
    }
}

function rotatePanorama(alpha) {
    
    // Set the start point once (optional)
    if (startAlpha === null) {
        startAlpha = alpha;
    }

    // Calculate rotation based on the initial start point
    const rotation = (alpha - startAlpha + 360) % 360;
    
    // Display data for testing
    alphaDisplay.textContent = rotation.toFixed(2);

    // Map rotation (0-360) to a suitable translateX range for the image
    const translateX = -((rotation / 360) * 100); // Adjusts image scrolling

    // Apply the calculated position
    img.style.transform = `translateX(${translateX}%)`;
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

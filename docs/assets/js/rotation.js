const btn = document.getElementById("request");
btn.addEventListener("click", permission);

function permission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    let startOrientation = null; // Anfangswinkel
                    let lastAlpha = null;       // Letzte bekannte Alpha-Position
                    let shift = -50;              // Akkumulierter Shift in %
    
                    window.addEventListener("deviceorientation", (event) => {
                        
                        const alpha = event.alpha; 
                        const beta = event.beta;
                        const gamma = event.gamma;
    
                        if (startOrientation === null) {
                            // Initiale Orientierung setzen
                            startOrientation = alpha;
                            lastAlpha = alpha; // Erste Alpha-Position speichern
                            displayStartingPoint(startOrientation); // Debugging
                        }
    
                        if (lastAlpha !== null) {
                            
                            let delta = alpha - lastAlpha;
    
                            // transition at 360°/0°-border
                            if (delta > 180) {
                                delta -= 360;
                            } else if (delta < -180) {
                                delta += 360;
                            }
    
                            // Akkumulierter Shift (in Prozent der Bildbreite)
                            shift += (delta / 360) * 100;
    
                            // picture gets only adjusted if device held correctly
                            if (Math.abs(beta) < 10 && (90 - Math.abs(gamma)) < 10) {
                                container.style.backgroundPositionX = `${-shift}%`;
                            }
    
                            // Debugging/Anzeige
                            displayRotationData(shift);
                            displayOrientationData(alpha, beta, gamma);
                        }
    
                        lastAlpha = alpha; // Alpha-Wert für das nächste Event speichern
                    });
                }
            })
            .catch(console.error);
    } else {
        alert("DeviceOrientationEvent is not defined for this device");
    }
    
}

document.addEventListener("DOMContentLoaded", () => {
    
    // container whose background image we want to set
    const container = document.getElementById("spaceContainer");

    // api key gets inserted in the request url
    const apiKey = 'IObSXih5k3lG7dSsjcj10QGQhmhnA2lRR9dDeFfl';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        const imageUrl = data.url;
        container.style.backgroundImage = `url(${imageUrl})`;
    })
    .catch(error => {
        console.error('Error while loading the image:', error);
    });
});

function displayStartingPoint(start) {
    document.getElementById('start').innerText = start !== null ? start.toFixed(2) : '-';
}

function displayPosition(position) {
    document.getElementById('position').innerText = position !== null ? start.toFixed(2) : '-';
}

function displayRotationData(rotation) {
    document.getElementById('rotation').innerText = rotation !== null ? rotation.toFixed(2) : '-';
}

function displayOrientationData(alpha, beta, gamma) {
    document.getElementById('alpha').innerText = alpha !== null ? alpha.toFixed(2) : '-';
    document.getElementById('beta').innerText = beta !== null ? beta.toFixed(2) : '-';
    document.getElementById('gamma').innerText = gamma !== null ? gamma.toFixed(2) : '-';
}
